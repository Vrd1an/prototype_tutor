export default function Notice({ sp }) {
  return sp?.e ? <p className="msg err" role="alert">{sp.e}</p> : sp?.ok ? <p className="msg okm">{sp.ok}</p> : null;
}
