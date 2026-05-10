const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
  max: 3
});

const jwtSecret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || "change-me";

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const route = getRoute(req);
  try {
    if (route === "/health" && req.method === "GET") return json(res, 200, { status: "ok", db: true });
    if (route === "/auth/login" && req.method === "POST") return login(req, res);
    if (route === "/auth/register" && req.method === "POST") return register(req, res);
    if (route === "/auth/logout" && req.method === "POST") return json(res, 200, { ok: true });
    if (route === "/me" && req.method === "GET") return me(req, res);
    if (route === "/substances" && req.method === "GET") return listSubstances(req, res, true);
    if (route.startsWith("/substances/") && req.method === "GET") return oneSubstance(req, res, route.split("/")[2], true);
    if (route === "/reactions" && req.method === "GET") return listReactions(req, res, true);
    if (route.startsWith("/reactions/") && req.method === "GET") return oneReaction(req, res, route.split("/")[2], true);
    if ((route === "/experiments" || route === "/experiments/attempts") && req.method === "POST") return createExperiment(req, res);
    if (route === "/progress/me" && req.method === "GET") return progress(req, res);
    if (route === "/periodic-elements" && req.method === "GET") return periodicElements(req, res);
    if (route.startsWith("/periodic-elements/") && req.method === "GET") return periodicElement(req, res, route.split("/")[2]);
    if (route === "/tasks" && req.method === "GET") return listTasks(req, res, true);
    if (route === "/handbook" && req.method === "GET") return listHandbook(req, res, true);

    const user = await requireAdmin(req);
    if (route === "/admin/dashboard" && req.method === "GET") return dashboard(res);
    if (route === "/admin/users" && req.method === "GET") return adminUsers(res);
    if (route.startsWith("/admin/users/") && req.method === "PATCH") return updateUser(req, res, route.split("/")[3], user.id);
    if (route === "/admin/reactions" && req.method === "GET") return listReactions(req, res, false);
    if (route === "/admin/reactions" && req.method === "POST") return saveReaction(req, res, null, user.id);
    if (route.startsWith("/admin/reactions/") && req.method === "PUT") return saveReaction(req, res, route.split("/")[3], user.id);
    if (route.startsWith("/admin/reactions/") && route.endsWith("/toggle") && req.method === "PATCH") return toggle(res, "reactions", route.split("/")[3], user.id);
    if (route.startsWith("/admin/reactions/") && req.method === "DELETE") return remove(res, "reactions", route.split("/")[3], user.id);
    if (route === "/admin/substances" && req.method === "GET") return listSubstances(req, res, false);
    if (route === "/admin/substances" && req.method === "POST") return saveSubstance(req, res, null, user.id);
    if (route.startsWith("/admin/substances/") && req.method === "PUT") return saveSubstance(req, res, route.split("/")[3], user.id);
    if (route.startsWith("/admin/substances/") && route.endsWith("/toggle") && req.method === "PATCH") return toggle(res, "substances", route.split("/")[3], user.id);
    if (route.startsWith("/admin/substances/") && req.method === "DELETE") return remove(res, "substances", route.split("/")[3], user.id);
    if (route === "/admin/periodic-elements" && req.method === "GET") return periodicElements(req, res);
    if (route.startsWith("/admin/periodic-elements/") && req.method === "PUT") return updateElement(req, res, route.split("/")[3], user.id);
    if (route === "/admin/experiments" && req.method === "GET") return experiments(res);
    if (route === "/admin/tasks" && req.method === "GET") return listTasks(req, res, false);
    if (route === "/admin/tasks" && req.method === "POST") return saveTask(req, res, null, user.id);
    if (route.startsWith("/admin/tasks/") && req.method === "PUT") return saveTask(req, res, route.split("/")[3], user.id);
    if (route.startsWith("/admin/tasks/") && route.endsWith("/toggle") && req.method === "PATCH") return toggle(res, "tasks", route.split("/")[3], user.id);
    if (route.startsWith("/admin/tasks/") && req.method === "DELETE") return remove(res, "tasks", route.split("/")[3], user.id);
    if (route === "/admin/handbook" && req.method === "GET") return listHandbook(req, res, false);
    if (route === "/admin/handbook" && req.method === "POST") return saveHandbook(req, res, null, user.id);
    if (route.startsWith("/admin/handbook/") && req.method === "PUT") return saveHandbook(req, res, route.split("/")[3], user.id);
    if (route.startsWith("/admin/handbook/") && route.endsWith("/toggle") && req.method === "PATCH") return toggle(res, "handbook_entries", route.split("/")[3], user.id);
    if (route.startsWith("/admin/handbook/") && req.method === "DELETE") return remove(res, "handbook_entries", route.split("/")[3], user.id);

    return json(res, 404, { error: "Endpoint не найден." });
  } catch (error) {
    const status = error.status || 500;
    if (status >= 500) console.error(error);
    return json(res, status, { error: status >= 500 ? "Внутренняя ошибка сервера." : error.message });
  }
};

function setCors(req, res) {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
}

function getRoute(req) {
  const url = new URL(req.url, "https://local");
  return url.pathname.replace(/^\/api/, "") || "/";
}

function json(res, status, payload) {
  res.status(status).json(payload);
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => data += chunk);
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (error) { reject(Object.assign(new Error("Некорректный JSON."), { status: 400 })); }
    });
  });
}

function sign(user) {
  return jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: "7d" });
}

async function currentUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw Object.assign(new Error("Нужен вход в аккаунт."), { status: 401 });
  let payload;
  try { payload = jwt.verify(token, jwtSecret); } catch { throw Object.assign(new Error("Сессия недействительна."), { status: 401 }); }
  const { rows } = await pool.query("SELECT id::text, email, name, role, status, created_at, updated_at, last_active_at, experiments_count, COALESCE(last_experiment_title,'') AS last_experiment_title FROM users WHERE id = $1", [payload.sub]);
  if (!rows[0]) throw Object.assign(new Error("Пользователь не найден."), { status: 401 });
  return rows[0];
}

async function requireAdmin(req) {
  const user = await currentUser(req);
  if (user.role !== "admin") throw Object.assign(new Error("Доступ только для администратора."), { status: 403 });
  return user;
}

async function login(req, res) {
  const body = await readBody(req);
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return json(res, 401, { error: "Неверный email или пароль." });
  }
  await pool.query("UPDATE users SET last_active_at = now(), updated_at = now() WHERE id = $1", [user.id]);
  delete user.password_hash;
  return json(res, 200, { token: sign(user), user });
}

async function register(req, res) {
  const body = await readBody(req);
  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || email).trim();
  const password = String(body.password || "");
  if (!email.includes("@") || password.length < 8) return json(res, 400, { error: "Проверьте email и пароль." });
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query("INSERT INTO users (email,name,password_hash,role) VALUES ($1,$2,$3,'user') RETURNING id::text,email,name,role,status,created_at", [email, name, hash]);
  return json(res, 201, { token: sign(rows[0]), user: rows[0] });
}

async function me(req, res) {
  return json(res, 200, { user: await currentUser(req) });
}

function reactionSelect(where = "") {
  return `SELECT id, title, type, reactant_a_id, reactant_b_id, equation, products, requires_heating, required_temperature, requires_catalyst, catalyst_id, liquid_color_before, liquid_color_after, has_gas, gas_label AS gas_name, has_precipitate, precipitate_color, has_heat, has_smoke, has_flash, danger_level, observation, explanation, safety, is_active, data, created_at, updated_at FROM reactions ${where} ORDER BY sort_order, title`;
}

async function listReactions(req, res, activeOnly) {
  const { rows } = await pool.query(reactionSelect(activeOnly ? "WHERE is_active = true" : ""));
  return json(res, 200, { reactions: rows.map(normalizeReaction) });
}

async function oneReaction(req, res, id, activeOnly) {
  const { rows } = await pool.query(reactionSelect("WHERE id = $1 " + (activeOnly ? "AND is_active = true" : "")), [id]);
  if (!rows[0]) return json(res, 404, { error: "Реакция не найдена." });
  return json(res, 200, { reaction: normalizeReaction(rows[0]) });
}

function normalizeReaction(row) {
  const data = row.data || {};
  return { ...data, ...row, reactants: [row.reactant_a_id, row.reactant_b_id].filter(Boolean), visualEffect: data.visualEffect || data.visual_effect || row.visual_effect };
}

async function listSubstances(req, res, activeOnly) {
  const { rows } = await pool.query(`SELECT id, name, formula, type, state, color, ions->>'cation' AS cation, ions->>'anion' AS anion, danger_level, description, is_active, data, created_at, updated_at FROM substances ${activeOnly ? "WHERE is_active = true" : ""} ORDER BY sort_order, name`);
  return json(res, 200, { substances: rows.map((r) => ({ ...(r.data || {}), ...r })) });
}

async function oneSubstance(req, res, id, activeOnly) {
  const { rows } = await pool.query(`SELECT id, name, formula, type, state, color, ions->>'cation' AS cation, ions->>'anion' AS anion, danger_level, description, is_active, data, created_at, updated_at FROM substances WHERE id = $1 ${activeOnly ? "AND is_active = true" : ""}`, [id]);
  if (!rows[0]) return json(res, 404, { error: "Вещество не найдено." });
  return json(res, 200, { substance: { ...(rows[0].data || {}), ...rows[0] } });
}

async function periodicElements(req, res) {
  const { rows } = await pool.query("SELECT id, atomic_number, symbol, COALESCE(name_ru,name_en,symbol) AS name, data, created_at, updated_at FROM elements ORDER BY atomic_number");
  return json(res, 200, { elements: rows.map(elementView) });
}

async function periodicElement(req, res, symbol) {
  const { rows } = await pool.query("SELECT id, atomic_number, symbol, COALESCE(name_ru,name_en,symbol) AS name, data, created_at, updated_at FROM elements WHERE lower(symbol)=lower($1)", [symbol]);
  if (!rows[0]) return json(res, 404, { error: "Элемент не найден." });
  return json(res, 200, { element: elementView(rows[0]) });
}

function elementView(row) {
  const data = row.data || {};
  return { ...data, ...row, atomic_mass: data.atomic_mass, group_number: data.group, period: data.period, category: data.category || data.color_group, state: data.state, usage: data.applications, interesting_fact: data.description, safety: data.hazards };
}

async function createExperiment(req, res) {
  const user = await currentUser(req);
  const body = await readBody(req);
  const reactionId = String(body.reaction_id || "").trim();
  if (!reactionId) return json(res, 400, { error: "reaction_id обязателен." });
  const reaction = await pool.query("SELECT title FROM reactions WHERE id=$1", [reactionId]);
  const title = reaction.rows[0]?.title || reactionId;
  const resultStatus = body.result_status || "success";
  const observation = body.observation || "";
  const input = body.input || {};
  const result = body.result || {};
  const { rows } = await pool.query(`INSERT INTO experiment_attempts (user_id,reaction_id,reaction_slug,selected_reactants,equipment,used_heating,result_status,observation,duration_ms,input,result) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`, [user.id, reactionId, body.reaction_slug || reactionId, JSON.stringify(body.selected_reactants || []), JSON.stringify(body.equipment || []), Boolean(body.used_heating), resultStatus, observation, Number(body.duration_ms || 0), JSON.stringify(input), JSON.stringify(result)]);
  await pool.query("UPDATE users SET experiments_count=experiments_count+1,last_experiment_title=$1,last_active_at=now(),updated_at=now() WHERE id=$2", [title, user.id]);
  await log(user.id, "experiment_run", "reaction", reactionId, { observation, resultStatus });
  return json(res, 201, { experiment: rows[0] });
}

async function progress(req, res) {
  const user = await currentUser(req);
  const { rows } = await pool.query("SELECT * FROM experiment_attempts WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50", [user.id]);
  return json(res, 200, { user, attempts: rows, summary: { experiments_count: user.experiments_count, last_experiment_title: user.last_experiment_title } });
}

async function dashboard(res) {
  const [users, reactions, substances, experiments, recentExperiments, recentActivities] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS count FROM users"),
    pool.query("SELECT COUNT(*)::int AS count FROM reactions"),
    pool.query("SELECT COUNT(*)::int AS count FROM substances"),
    pool.query("SELECT COUNT(*)::int AS count FROM experiment_attempts"),
    pool.query("SELECT id::text, user_id::text, reaction_id, COALESCE(observation,result_status,'') AS result, created_at FROM experiment_attempts ORDER BY created_at DESC LIMIT 8"),
    pool.query("SELECT id::text, COALESCE(user_id::text,'') AS user_id, action, entity_type, entity_id, details_json, created_at FROM activity_logs ORDER BY created_at DESC LIMIT 12")
  ]);
  return json(res, 200, { totalUsers: users.rows[0].count, totalReactions: reactions.rows[0].count, totalSubstances: substances.rows[0].count, totalExperiments: experiments.rows[0].count, recentExperiments: recentExperiments.rows, recentActivities: recentActivities.rows });
}

async function adminUsers(res) {
  const { rows } = await pool.query("SELECT id::text,email,name,role,status,created_at,updated_at,last_active_at,experiments_count,COALESCE(last_experiment_title,'') AS last_experiment_title FROM users ORDER BY created_at DESC");
  return json(res, 200, { users: rows });
}

async function updateUser(req, res, id, adminId) {
  const body = await readBody(req);
  await pool.query("UPDATE users SET name=COALESCE(NULLIF($1,''),name), role=COALESCE(NULLIF($2,''),role), status=COALESCE(NULLIF($3,''),status), updated_at=now() WHERE id=$4", [body.name || "", body.role || "", body.status || "", id]);
  await log(adminId, "admin_update_user", "user", id, body);
  return adminUsers(res);
}

function slug(value) {
  return String(value || "").toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-|-$/g, "") || String(Date.now());
}

async function saveReaction(req, res, id, adminId) {
  const body = await readBody(req);
  const title = String(body.title || "").trim();
  if (!title) return json(res, 400, { error: "Название реакции обязательно." });
  id = id || body.id || slug(title);
  const reactants = JSON.stringify([body.reactant_a_id, body.reactant_b_id].filter(Boolean));
  await pool.query(`INSERT INTO reactions (id,slug,title,type,reactant_a_id,reactant_b_id,equation,products,reactants,requires_heating,required_temperature,requires_catalyst,catalyst_id,liquid_color_before,liquid_color_after,has_gas,gas_label,has_precipitate,precipitate_color,has_heat,has_smoke,has_flash,danger_level,observation,explanation,safety,data,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,now()) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title,type=EXCLUDED.type,reactant_a_id=EXCLUDED.reactant_a_id,reactant_b_id=EXCLUDED.reactant_b_id,equation=EXCLUDED.equation,products=EXCLUDED.products,reactants=EXCLUDED.reactants,requires_heating=EXCLUDED.requires_heating,required_temperature=EXCLUDED.required_temperature,requires_catalyst=EXCLUDED.requires_catalyst,catalyst_id=EXCLUDED.catalyst_id,liquid_color_before=EXCLUDED.liquid_color_before,liquid_color_after=EXCLUDED.liquid_color_after,has_gas=EXCLUDED.has_gas,gas_label=EXCLUDED.gas_label,has_precipitate=EXCLUDED.has_precipitate,precipitate_color=EXCLUDED.precipitate_color,has_heat=EXCLUDED.has_heat,has_smoke=EXCLUDED.has_smoke,has_flash=EXCLUDED.has_flash,danger_level=EXCLUDED.danger_level,observation=EXCLUDED.observation,explanation=EXCLUDED.explanation,safety=EXCLUDED.safety,data=EXCLUDED.data,updated_at=now()`, [id, slug(id), title, body.type || "other", body.reactant_a_id || null, body.reactant_b_id || null, body.equation || "", JSON.stringify(body.products || []), reactants, Boolean(body.requires_heating), body.required_temperature || "", Boolean(body.requires_catalyst), body.catalyst_id || null, body.liquid_color_before || "", body.liquid_color_after || "", Boolean(body.has_gas), body.gas_name || "", Boolean(body.has_precipitate), body.precipitate_color || "", Boolean(body.has_heat), Boolean(body.has_smoke), Boolean(body.has_flash), body.danger_level || "low", body.observation || "", body.explanation || "", body.safety || "", JSON.stringify(body)]);
  await log(adminId, "admin_save_reaction", "reaction", id, body);
  return oneReaction(req, res, id, false);
}

async function saveSubstance(req, res, id, adminId) {
  const body = await readBody(req);
  if (!body.name || !body.formula) return json(res, 400, { error: "Название и формула обязательны." });
  id = id || body.id || body.formula;
  const ions = JSON.stringify({ cation: body.cation || "", anion: body.anion || "" });
  await pool.query(`INSERT INTO substances (id,slug,name,formula,type,state,color,ions,danger_level,safety_level,description,data,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9,$10,$11,now()) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,formula=EXCLUDED.formula,type=EXCLUDED.type,state=EXCLUDED.state,color=EXCLUDED.color,ions=EXCLUDED.ions,danger_level=EXCLUDED.danger_level,safety_level=EXCLUDED.safety_level,description=EXCLUDED.description,data=EXCLUDED.data,updated_at=now()`, [id, slug(id), body.name, body.formula, body.type || "other", body.state || "solution", body.color || "", ions, body.danger_level || "low", body.description || "", JSON.stringify(body)]);
  await log(adminId, "admin_save_substance", "substance", id, body);
  return oneSubstance(req, res, id, false);
}

async function toggle(res, table, id, adminId) {
  await pool.query(`UPDATE ${table} SET is_active = NOT is_active, updated_at=now() WHERE id=$1`, [id]);
  await log(adminId, "admin_toggle", table, id, {});
  return json(res, 200, { ok: true });
}

async function remove(res, table, id, adminId) {
  await pool.query(`DELETE FROM ${table} WHERE id=$1`, [id]);
  await log(adminId, "admin_delete", table, id, {});
  return json(res, 200, { ok: true });
}

async function updateElement(req, res, id, adminId) {
  const body = await readBody(req);
  const patch = { applications: body.usage || "", description: body.interesting_fact || "", hazards: body.safety || "", electronegativity: body.electronegativity || "", discovered_by: body.discovered_by || "", discovery_year: body.discovery_year || "" };
  await pool.query("UPDATE elements SET data = data || $1::jsonb, updated_at=now() WHERE id=$2", [JSON.stringify(patch), id]);
  await log(adminId, "admin_update_element", "element", id, body);
  return periodicElements(req, res);
}

async function experiments(res) {
  const { rows } = await pool.query("SELECT id::text,user_id::text,reaction_id,COALESCE(observation,result_status,'') AS result,created_at FROM experiment_attempts ORDER BY created_at DESC LIMIT 200");
  return json(res, 200, { experiments: rows });
}

async function listTasks(req, res, activeOnly) {
  const { rows } = await pool.query(`SELECT * FROM tasks ${activeOnly ? "WHERE is_active=true" : ""} ORDER BY updated_at DESC`);
  return json(res, 200, { tasks: rows });
}

async function saveTask(req, res, id, adminId) {
  const body = await readBody(req);
  if (!body.title || !body.goal) return json(res, 400, { error: "Название и цель обязательны." });
  id = id || body.id || slug(body.title);
  await pool.query(`INSERT INTO tasks (id,title,level,goal,reagents,hints,reaction_id,points,data,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,now()) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title,level=EXCLUDED.level,goal=EXCLUDED.goal,reagents=EXCLUDED.reagents,hints=EXCLUDED.hints,reaction_id=EXCLUDED.reaction_id,points=EXCLUDED.points,data=EXCLUDED.data,updated_at=now()`, [id, body.title, body.level || "easy", body.goal, JSON.stringify(body.reagents || []), JSON.stringify(body.hints || []), body.reaction_id || null, Number(body.points || 10), JSON.stringify(body)]);
  await log(adminId, "admin_save_task", "task", id, body);
  return listTasks(req, res, false);
}

async function listHandbook(req, res, activeOnly) {
  const { rows } = await pool.query(`SELECT * FROM handbook_entries ${activeOnly ? "WHERE is_active=true" : ""} ORDER BY sort_order,title`);
  return json(res, 200, { entries: rows });
}

async function saveHandbook(req, res, id, adminId) {
  const body = await readBody(req);
  if (!body.title || !body.text) return json(res, 400, { error: "Заголовок и текст обязательны." });
  id = id || body.id || slug(body.title);
  await pool.query(`INSERT INTO handbook_entries (id,category,icon,title,text,sort_order,updated_at) VALUES ($1,$2,$3,$4,$5,$6,now()) ON CONFLICT (id) DO UPDATE SET category=EXCLUDED.category,icon=EXCLUDED.icon,title=EXCLUDED.title,text=EXCLUDED.text,sort_order=EXCLUDED.sort_order,updated_at=now()`, [id, body.category || "Справочник", body.icon || "", body.title, body.text, Number(body.sort_order || 0)]);
  await log(adminId, "admin_save_handbook", "handbook", id, body);
  return listHandbook(req, res, false);
}

async function log(userId, action, entityType, entityId, details) {
  await pool.query("INSERT INTO activity_logs (user_id,action,entity_type,entity_id,details_json) VALUES ($1,$2,$3,$4,$5)", [userId || null, action, entityType, entityId, JSON.stringify(details || {})]);
}
