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


/**
 * Checks if a password is valid and matches a hash
 * @param {String} plainPassword
 * @param {String} hash
 * @returns
 */
async function verifyPassword(plainPassword, hash) {
  if(hash[0] !== '$'){
    //not a hash
    return false
  }
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
