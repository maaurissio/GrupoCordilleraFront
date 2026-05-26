export function Topbar({ nombre, roleLabel }: { nombre: string; roleLabel: string }) {
  return (
    <header className="workspace-topbar glass-panel">
      <div>
        <p className="section-kicker">Panel ejecutivo</p>
        <h2>Hola, {nombre}</h2>
      </div>
      <div className="topbar-tools">
        <div className="identity-pill">
          <div className="identity-avatar">{nombre.charAt(0).toUpperCase()}</div>
          <div>
            <strong>{nombre}</strong>
            <span>{roleLabel}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
