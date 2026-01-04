1. Front: añadir Autocomplete/Places de Google Maps en el modal de listing (o una pantalla
   separada), capturando place_id, dirección formateada, y lat/lng desde la selección; mostrar un
   mapa para mover pin y ajustar.
2. API/DB: agregar campos placeId, formattedAddress y tal vez locationLabel (colonia/zona) para
   guardar lo devuelto por Google; persistir lat, lng.
3. UX: permitir que el usuario arrastre el pin y guarde lat/lng; opcional: reverse geocode en
   backend para validar.
4. Roles: decidir si los “otros usuarios” serán publishers autenticados (rol existente) o si habrá
   un endpoint público de captura que cree un draft y dispare notificación/moderación.
