const { dbWrite } = require("../config/db");
const { paginate } = require("../utils/pagination");

// Find user by email
const findUserByEmail = async (email) => {
  return await dbWrite("users")
    .where({ email })
    .first();
};

// Get user by ID
const getUserById = async (id) => {
  return await dbWrite("users")
    .where({ user_id: id })
    .first();
};

// Create user
const createUser = async (
  name,
  email,
  passwordHash,
  role,
  year,
  department,
  rollno,
  phone
) => {
  const [user] = await dbWrite("users")
    .insert({
      name,
      email,
      password_hash: passwordHash,
      role,
      year,
      department,
      rollno,
      phone,
    })
    .returning([
      "user_id",
      "name",
      "email",
      "role",
      "year",
      "department",
      "rollno",
      "phone",
    ]);

  return user;
};

// Get all students
const getAllStudents = async (role, year = null) => {
  let query = dbWrite("users")
    .select(
      "user_id",
      "name",
      "email",
      "role",
      "department",
      "year",
      "phone",
      "rollno"
    )
    .where({ role })
    .orderBy("user_id", "asc");

  if (year) {
    query.andWhere({ year });
  }

  return await query;
};

// Update user
const updateUser = async (id, updatedFields) => {
  const [user] = await dbWrite("users")
    .where({ user_id: id })
    .update(updatedFields)
    .returning("*");

  return user;
};

// Delete user
const deleteUser = async (id) => {
  const [user] = await dbWrite("users")
    .where({ user_id: id })
    .del()
    .returning("*");

  return user;
};

// Pagination
const getAllPaginatedUsers = async ({role}) => {
  

  return await dbWrite("users")
    .select(
      "user_id",
      "name",
      "email",
      "role",
      "year",
      "department",
      "rollno",
      "phone"
    )
    .orderBy("user_id", "asc")
     .where({ role })
};

const getAllPaginatedRoleUsers = async (page, limit, role) => {
  const offset = (page - 1) * limit;

  return await dbWrite("users")
    .select(
      "user_id",
      "name",
      "email",
      "role",
      "year",
      "department",
      "rollno",
      "phone"
    )
    .where({ role })
    .orderBy("user_id", "asc")
    .limit(limit)
    .offset(offset);
};

// Department users
const getDepartmentUsers = async (role, department) => {
  return await dbWrite("users")
    .select(
      "user_id",
      "name",
      "email",
      "role",
      "year",
      "department",
      "rollno",
      "phone"
    )
    .where({ role, department })
    .orderBy("user_id", "asc");
};

// All users of a role
const getAllRoleUsers = async (role) => {
  return await dbWrite("users")
    .select(
      "user_id",
      "name",
      "email",
      "role",
      "year",
      "department",
      "rollno",
      "phone"
    )
    .where({ role })
    .orderBy("user_id", "asc");
};

// Count users
const getUserCount = async () => {
  const [admin] = await dbWrite("users").where({ role: "admin" }).count();
  const [user] = await dbWrite("users").where({ role: "user" }).count();
  
  return {
    admin: Number(admin.count),
    user: Number(user.count)
  };
};

// Get basic users
const getUsers = async () => {
  return await dbWrite("users").select("user_id", "name", "email");
};

// Get user by email
const getUserByEmail = async (email) => {
  return await dbWrite("users")
    .where({ email })
    .first();
};

module.exports = {
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getAllPaginatedUsers,
  getAllPaginatedRoleUsers,
  getDepartmentUsers,
  getUserCount,
  getAllStudents,
  getUserById,
  getUsers,
  getUserByEmail,
  getAllRoleUsers
};
