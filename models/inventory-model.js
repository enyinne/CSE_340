const pool = require("../database/")

async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_id"
  )
}

async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
       JOIN public.classification AS c
       ON i.classification_id = c.classification_id
       WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error)
  }
}

async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
       JOIN public.classification AS c
       ON i.classification_id = c.classification_id
       WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getVehicleById error: " + error)
  }
}

async function addClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO public.classification (classification_name)
      VALUES ($1)
      RETURNING *;
    `
    const result = await pool.query(sql, [classification_name])
    return result.rows[0]
  } catch (error) {
    console.error("addClassification error: " + error)
    return null
  }
}

async function addInventory({
  classification_id,
  inv_make,
  inv_model,
  inv_year,
  inv_price,
  inv_mile,   
  inv_color,
  inv_description,
  inv_image,
  inv_thumbnail,
}) {
  try {
    const sql = `
      INSERT INTO public.inventory
      (classification_id, inv_make, inv_model, inv_year, inv_price, inv_mile,
       inv_color, inv_description, inv_image, inv_thumbnail)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `

    const values = [
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_mile,
      inv_color,
      inv_description,
      inv_image,
      inv_thumbnail,
    ]

    const result = await pool.query(sql, values)
    return result.rows[0]

  } catch (error) {
    console.error("addInventory error: " + error)
    return null
  }
}


module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory,
}
