/* The paw (wallet) against real signed testnet transactions (fixtures/signed-txs.json):
 *   1. re-encoding each tx's JSON body with our Msg encoder gives the exact on-chain body bytes;
 *   2. the SignDoc we build from those bytes verifies against the signer's real signature;
 *   3. addresses derive from public keys exactly as the chain derives them.
 * Plus the clan sign-up and sign-in messages, byte for byte. Nothing is broadcast. */
import { readFileSync } from 'node:fs';
import { txBody, signDoc, authInfo, signTx } from '../src/wallet/tx';
import { readFields, legacyDec } from '../src/wallet/proto';
import { deriveKey, verifyBytes, fromB64, toHex, isAddress, normaliseMnemonic, addressOf } from '../src/wallet/keys';
import { validateMsg } from '../src/wallet/encode';
import { buildLoginMessage } from '../src/guild/api';
import { ok, done } from './check';

const eq = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((x, i) => x === b[i]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const fx = JSON.parse(readFileSync(new URL('./fixtures/signed-txs.json', import.meta.url), 'utf8')) as {
  chainId: string; txs: { action: string; json: Any; raw: string; accountNumber: string }[];
};

for (const t of fx.txs) {
  const raw = readFields(fromB64(t.raw));
  const bodyBytes = raw.get(1)![0] as Uint8Array;
  const authBytes = raw.get(2)![0] as Uint8Array;
  const sig = raw.get(3)![0] as Uint8Array;
  const msgs = t.json.body.messages.map((m: Any) => { const { '@type': typeUrl, ...value } = m; return { typeUrl, value }; });
  const errs = msgs.flatMap(validateMsg);
  ok(!errs.length, `${t.action}: validates (${errs.join('; ')})`);
  const ours = txBody(msgs, t.json.body.memo);
  ok(eq(ours, bodyBytes), `${t.action}: body bytes match chain`);
  if (!eq(ours, bodyBytes)) { console.error('  ours  ', toHex(ours)); console.error('  chain ', toHex(bodyBytes)); }
  const pub = fromB64(t.json.auth_info.signer_infos[0].public_key.key);
  const fee = t.json.auth_info.fee;
  const ourAuth = authInfo(pub, BigInt(t.json.auth_info.signer_infos[0].sequence), { amount: fee.amount, gas: Number(fee.gas_limit) });
  ok(eq(ourAuth, authBytes), `${t.action}: auth info bytes match chain`);
  ok(verifyBytes(pub, signDoc(bodyBytes, authBytes, fx.chainId, BigInt(t.accountNumber)), sig), `${t.action}: signature verifies over our SignDoc`);
}

for (const t of fx.txs.slice(0, 4)) ok(addressOf(fromB64(t.json.auth_info.signer_infos[0].public_key.key)) === t.json.body.messages[0].creator, `${t.action}: pubkey → creator address`);
const k = deriveKey('special sign fit simple patrol salute grocery chicken wheat radar tonight ceiling');
ok(k.path === "m/44'/118'/0'/0/0" && k.pubKey.length === 33, 'derives a compressed key on the Cosmos path');
ok(isAddress(k.address) && k.address.startsWith('structs1'), 'address is a structs bech32');
ok(normaliseMnemonic('1. Special  2) sign\nfit') === 'special sign fit', 'normalises pasted phrases');

const tx = signTx(k, [{ typeUrl: '/structs.structs.MsgStructActivate', value: { creator: k.address, structId: '5-1' } }],
  { chainId: 'structstestnet-111', accountNumber: 7n, sequence: 3n }, { amount: [{ denom: 'ualpha', amount: '0' }], gas: 500000 });
const f = readFields(tx);
ok(verifyBytes(k.pubKey, signDoc(f.get(1)![0] as Uint8Array, f.get(2)![0] as Uint8Array, 'structstestnet-111', 7n), f.get(3)![0] as Uint8Array), 'own signature verifies');
ok(legacyDec('0.05') === '50000000000000000' && legacyDec('1') === '1000000000000000000', 'LegacyDec scaling');

ok(buildLoginMessage('0-5', k.address, 1760000000) === `LOGIN_GUILD0-5ADDRESS${k.address}DATETIME1760000000`, 'clan sign-in message is exact');
done('wallet');
