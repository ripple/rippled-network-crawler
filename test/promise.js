var Promise = require('bluebird')

function asyncFunc(callback) {
  setTimeout(function() {
    callback(null, 12345)
  }, 1000)
}

asyncFunc(function(error, result) {
  if (error) {
    console.log('error', error)
  } else {
    console.log('result', result)
  }
})

function another() {
  return new Promise(function(resolve, reject){
    setTimeout(function() {
      reject(new Error('fail!'))
    }, 1000)
  })
}

another().then(function(result) {
  console.log('another result', result)
})
.catch(function(error) {
  console.log('error', error)
})
