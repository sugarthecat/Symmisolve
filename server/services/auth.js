const bcrypt = require('bcrypt')

async function hashPassword(plainPassword) {
  // on success return hash
  // on error throw
  try{
    const hash = await bcrypt.hash(plainPassword, 10)
    return hash
  }catch(err){
    {throw err}
  }
}

async function verifyPassword(plainPassword, hash) {
  // on valid password return true
  // on invalid return false
  try{
    const verification = await bcrypt.compare(plainPassword, hash)
    return verification
  } catch(err){
    return false
  }
}

module.exports = { hashPassword, verifyPassword }
