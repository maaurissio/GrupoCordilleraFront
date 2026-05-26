import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Form, Input, Label, TextField } from '@heroui/react'
import type { UserProfile } from '../apis/users'

type LoginFormState = {
  email: string
  password: string
}

const operationalNotes = [
  { title: 'Mesa de control', text: 'Centraliza la creacion de usuarios, roles y seguimiento operativo desde una sola vista.' },
  { title: 'Flujo protegido', text: 'El acceso al ecosistema se realiza por BFF para mantener trazabilidad y consistencia.' },
]

export function AuthPage({
  login,
}: {
  login: (email: string, password: string) => Promise<UserProfile>
}) {
  const [form, setForm] = useState<LoginFormState>({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      const status = (err as { status?: number }).status
      if (status === 401) setError('Las credenciales ingresadas no son validas.')
      else if (status === 400) setError('Completa correctamente los campos solicitados.')
      else setError('No fue posible iniciar sesion en este momento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-scene">
        <div className="auth-intro glass-panel">
          <p className="brand-kicker">Grupo Cordillera</p>
          <h1>Centro de coordinacion administrativa</h1>
          <p className="auth-copy">
            Plataforma de acceso interno para supervisar usuarios, coordinar sucursales y gestionar la operacion diaria de la compania.
          </p>
          <div className="auth-notes">
            {operationalNotes.map((note) => (
              <article key={note.title} className="auth-note-card">
                <h3>{note.title}</h3>
                <p>{note.text}</p>
              </article>
            ))}
          </div>
        </div>

        <Card className="login-panel glass-panel">
          <Card.Header className="login-panel-header">
            <div>
              <p className="section-kicker">Acceso corporativo</p>
              <h2>Iniciar sesion</h2>
              <p className="panel-copy">Ingresa con tu cuenta autorizada para acceder al entorno de trabajo de Grupo Cordillera.</p>
            </div>
          </Card.Header>
          <Card.Content className="login-panel-body">
            <Form className="login-form" onSubmit={handleSubmit}>
              <TextField>
                <Label>Correo corporativo</Label>
                <Input type="email" value={form.email} onChange={(event) => setForm((c) => ({ ...c, email: event.target.value }))} required />
              </TextField>
              <TextField>
                <Label>Contrasena</Label>
                <Input type="password" value={form.password} onChange={(event) => setForm((c) => ({ ...c, password: event.target.value }))} required />
              </TextField>
              {error ? <p className="form-error">{error}</p> : null}
              <Button type="submit" variant="primary" isDisabled={loading} className="submit-button">
                {loading ? 'Validando acceso...' : 'Entrar al panel'}
              </Button>
            </Form>
          </Card.Content>
        </Card>
      </section>
    </main>
  )
}
