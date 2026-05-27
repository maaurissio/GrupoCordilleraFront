import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Form, Input, Label, TextField } from '@heroui/react'
import type { UserProfile } from '../apis/users'

type LoginFormState = {
  email: string
  password: string
}

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
            Ingrese a la plataforma de monitoreo inteligente para el desempeño organizacional, acceda a información consolidada y visualice los indicadores clave del negocio en tiempo real.
          </p>
        </div>

        <Card className="login-panel glass-panel">
          <Card.Header className="login-panel-header">
            <div>
              <p className="section-kicker">Acceso dashboard</p>
              <h2>Iniciar sesión</h2>
              <p className="panel-copy">Ingresa tu cuenta para acceder al dashboard de Grupo Cordillera</p>
            </div>
          </Card.Header>
          <Card.Content className="login-panel-body">
            <div className="login-form-shell">
              <Form className="login-form" onSubmit={handleSubmit}>
                <TextField className="login-field">
                  <Label>Correo</Label>
                  <Input type="email" value={form.email} onChange={(event) => setForm((c) => ({ ...c, email: event.target.value }))} required />
                </TextField>
                <TextField className="login-field">
                  <Label>Contraseña</Label>
                  <Input type="password" value={form.password} onChange={(event) => setForm((c) => ({ ...c, password: event.target.value }))} required />
                </TextField>
                {error ? <p className="form-error">{error}</p> : null}
                <Button type="submit" variant="primary" isDisabled={loading} className="submit-button login-submit-button">
                  {loading ? 'Validando acceso...' : 'Entrar al panel'}
                </Button>
              </Form>
            </div>
          </Card.Content>
        </Card>
      </section>
    </main>
  )
}
