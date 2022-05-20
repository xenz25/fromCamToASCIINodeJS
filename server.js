const express = require('express')
const { env } = require('process')
const app = express()

const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)

const port = process.env.PORT || 3000

app.use(express.static('./frontend/static'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('start')
})

// SOCKET
var Jimp = require('jimp')

var ascStreamer = io.of('/asc-streamer')

// use only when saving file
// var STREAM_SESSIONS = {}
// const fs = require('fs')
// const { v4: uuidv4 } = require('uuid')

var reMapValues = (x, in_min, in_max, out_min, out_max) => {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}

var toggle = 0

ascStreamer.on('connection', socket => {
  // use only for saving file
  // STREAM_SESSIONS[socket.id] = {
  //   streamId: socket.id,
  //   imgStreamFname: `${uuidv4()}-${Date.now()}.jpeg`
  // }
  console.log('Stream Connected id:', socket.id)

  socket.on('process-img', (dataUrl, contrast = 0, resolution) => {
    try {
      var asciiDense = 'Ñ@#W$9876543210?!abc;:+=-,._ '
      for (var i = 0; i < contrast; i++) asciiDense += ' ' // increase contrast value by adding more empty characters
      dataUrl = dataUrl.replace('data:image/png;base64,', '')
      const buffer = Buffer.from(dataUrl, 'base64')
      // var filePath = `./stream_imgs/${
      //   STREAM_SESSIONS[socket.id].imgStreamFname
      // }`
      // fs.writeFileSync(filePath, buffer)
      Jimp.read(buffer)
        .then(image => {
          var imgAsciiString = ''
          var imgAsciiStringRaw = ''
          image = image.resize(parseInt(resolution), parseInt(resolution)).greyscale()
          // processor code
          for (var h = 0; h < image.getHeight(); h++) {
            for (var w = 0; w < image.getWidth(); w++) {
              var hexData = image.getPixelColor(w, h)
              var rgba = Jimp.intToRGBA(hexData)

              var average = (rgba.r + rgba.g + rgba.b) / 3
              var charVal = Math.floor(
                reMapValues(average, 0, 255, asciiDense.length, 0)
              )
              if (asciiDense.charAt(charVal) == ' ') imgAsciiString += '&nbsp;'
              else imgAsciiString += asciiDense.charAt(charVal)
              imgAsciiStringRaw += asciiDense.charAt(charVal)
            }
            imgAsciiString += '<br>'
            imgAsciiStringRaw += "\n"
          }
          socket.emit('image-ready', imgAsciiString, imgAsciiStringRaw)
          // console.log(imgAsciiString)
        })
        .catch(err => {
          console.log('ON JIMP PROCESS:', err)
        })
    } catch (err) {
      console.log('ON PROCESSING:', err)
    }
  })

  socket.on('disconnect', () => {
    console.log('session ended:', socket.id)

    // try {
    //   fs.unlink(
    //     `./stream_imgs/${STREAM_SESSIONS[socket.id].imgStreamFname}`,
    //     err => {
    //       if (err) {
    //         console.log('ON PROCESSING DISCONNECT:', err)
    //       } else {
    //         console.log('session ended:', socket.id)
    //       }
    //     }
    //   )
    // } catch (err) {
    //   console.log('ON PROCESSING DISCONNECT:', err)
    // }
  })
})

httpServer.listen(port, () => {
  console.log(`Server running at posrt: ${port}`)
})
