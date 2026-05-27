import { Button } from '@heroui/react'

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content glass-panel" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <Button variant="secondary" className="btn-secondary-minimal" onPress={onCancel} isDisabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="confirm-button"
            onPress={onConfirm}
            isDisabled={loading}
          >
            {loading ? 'Procesando...' : confirmLabel ?? 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
