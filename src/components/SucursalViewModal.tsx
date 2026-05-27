import { useEffect, useRef, useState } from 'react'
import { Button } from '@heroui/react'
import { getAssignmentsBySucursal, type UsuarioSucursalAssignment } from '../apis/usuarioSucursales'
import type { Sucursal } from '../apis/sucursales'
import type { Map as MapLibreMap } from 'maplibre-gl'

type Coordinates = { lng: number; lat: number }

async function geocodeSucursal(sucursal: Sucursal): Promise<Coordinates | null> {
  const query = [sucursal.direccion, sucursal.ciudad, sucursal.region, 'Chile'].filter(Boolean).join(', ')
  if (!query) return null

  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`, {
    headers: { 'Accept-Language': 'es' },
  })

  if (!response.ok) return null

  const data = await response.json() as Array<{ lon: string; lat: string }>
  const first = data[0]
  if (!first) return null

  return { lng: Number(first.lon), lat: Number(first.lat) }
}

export function SucursalViewModal({
  sucursal,
  open,
  onClose,
}: {
  sucursal: Sucursal | null
  open: boolean
  onClose: () => void
}) {
  const [assignments, setAssignments] = useState<UsuarioSucursalAssignment[]>([])
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [loading, setLoading] = useState(false)
  const [mapError, setMapError] = useState('')
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)

  useEffect(() => {
    if (!open || !sucursal) {
      setAssignments([])
      setCoordinates(null)
      setMapError('')
      return
    }

    const currentSucursal = sucursal
    let ignore = false

    async function loadDetail() {
      setLoading(true)
      setMapError('')

      try {
        const [assignmentData, coordinateData] = await Promise.all([
          getAssignmentsBySucursal(currentSucursal.id),
          geocodeSucursal(currentSucursal),
        ])

        if (ignore) return
        setAssignments(assignmentData)
        setCoordinates(coordinateData)
        if (!coordinateData) setMapError('No fue posible ubicar esta direccion en el mapa.')
      } catch {
        if (ignore) return
        setAssignments([])
        setCoordinates(null)
        setMapError('No fue posible cargar el mapa de esta sucursal.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void loadDetail()

    return () => {
      ignore = true
    }
  }, [open, sucursal])

  useEffect(() => {
    if (!open || !coordinates || !mapContainerRef.current) return

    const currentCoordinates = coordinates
    let cancelled = false

    async function initializeMap() {
      const { default: maplibregl } = await import('maplibre-gl')
      if (cancelled || !mapContainerRef.current) return

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.openfreemap.org/styles/bright',
        center: [currentCoordinates.lng, currentCoordinates.lat],
        zoom: 13.5,
        cooperativeGestures: true,
      })

      mapRef.current = map
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

      map.on('load', () => {
        const pointSource: GeoJSON.FeatureCollection<GeoJSON.Point> = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {},
            geometry: {
            type: 'Point',
              coordinates: [currentCoordinates.lng, currentCoordinates.lat],
            },
          }],
        }

        map.addSource('sucursal-point', { type: 'geojson', data: pointSource })

        map.addLayer({
          id: 'sucursal-radius',
          type: 'circle',
          source: 'sucursal-point',
          paint: {
            'circle-radius': 34,
            'circle-color': '#161a1c',
            'circle-opacity': 0.08,
            'circle-stroke-width': 1,
            'circle-stroke-color': 'rgba(22,26,28,0.12)',
          },
        })

        map.addLayer({
          id: 'sucursal-center',
          type: 'circle',
          source: 'sucursal-point',
          paint: {
            'circle-radius': 10,
            'circle-color': '#161a1c',
            'circle-stroke-width': 3,
            'circle-stroke-color': '#f8f9fa',
          },
        })
      })
    }

    void initializeMap()

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [coordinates, open])

  if (!open || !sucursal) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-wide glass-panel" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="section-kicker">Detalle territorial</p>
            <h3 className="modal-title">{sucursal.nombre}</h3>
          </div>
          <Button variant="secondary" className="btn-secondary-minimal modal-close-button" onPress={onClose}>
            Cerrar
          </Button>
        </div>

        <div className="user-modal-summary sucursal-modal-summary">
          <div>
            <strong>{sucursal.ciudad ?? 'Ciudad no asignada'}</strong>
            <span>{sucursal.region ?? 'Region no asignada'}</span>
          </div>
          <div className="sucursal-summary-note">Vista inspirada en mapcn</div>
        </div>

        <div className="user-detail-grid sucursal-detail-grid">
          <div className="detail-section detail-card">
            <h4>Ubicacion</h4>
            <div className="detail-row"><span className="detail-label">Direccion</span><span>{sucursal.direccion}</span></div>
            <div className="detail-row"><span className="detail-label">Ciudad</span><span>{sucursal.ciudad ?? '—'}</span></div>
            <div className="detail-row"><span className="detail-label">Region</span><span>{sucursal.region ?? '—'}</span></div>
            <div className="detail-row"><span className="detail-label">Usuarios</span><span>{assignments.length}</span></div>
          </div>

          <div className="detail-section detail-card">
            <h4>Equipo asignado</h4>
            <div className="assignment-list">
              {assignments.length === 0 && !loading ? <p className="modal-loading-note">No hay usuarios asociados.</p> : null}
              {assignments.map((assignment) => (
                <div key={assignment.id} className="assignment-row">
                  <strong>{assignment.nombreUsuario}</strong>
                  <span>{assignment.asignadoEn ? new Date(assignment.asignadoEn).toLocaleDateString('es-CL') : 'Asignacion activa'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sucursal-map-shell detail-card">
          <div className="selection-panel-head">
            <div>
              <p className="section-kicker">Mapa</p>
              <strong className="map-panel-title">Contexto geografico</strong>
            </div>
            <span>{coordinates ? 'Ubicacion encontrada' : 'Ubicacion estimada por direccion'}</span>
          </div>
          <div className="sucursal-map" ref={mapContainerRef} />
          {mapError ? <p className="modal-loading-note">{mapError}</p> : null}
        </div>
      </div>
    </div>
  )
}
