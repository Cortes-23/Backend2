import Office from "../models/Office.js"

/*
  Uso: agregar este middleware a todas las rutas que requieran tenant.
  El frontend debe enviar el header: x-tenant-slug: "nombre-oficina"
*/
const tenantMiddleware = async (req, res, next) => {
  try {
    const slug = req.headers["x-tenant-slug"]

    if (!slug) {
      return res.status(400).json({ message: "Tenant no identificado (falta x-tenant-slug)" })
    }

    const office = await Office.findOne({ slug, active: true })

    if (!office) {
      return res.status(404).json({ message: "Oficina no encontrada o inactiva" })
    }

    req.officeId = office._id   // disponible en todos los controllers
    req.office = office
    next()

  } catch (error) {
    res.status(500).json({ message: "Error verificando tenant" })
  }
}

export default tenantMiddleware