;(function () {
  const socket = io('/asc-streamer')
  const vidElm = document.getElementById('vid-frame')
  var canvas = document.getElementById('canv-frame')
  var MediaStream
  var constraints = { video: true, audio: false }
  var prevReso = $('#range-reso').val()
  var copyAble = '';

  function mediaController (err, stream) {
    if (err) {
      alert('Stream not Supported!')
      socket.disconnect()
    } else {
      console.log('got a stream', stream)
      vidElm.srcObject = stream
      vidElm.play()
      MediaStream = stream.getTracks()[0]
    }
  }

  var camico = {
    open: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
    fill="currentColor" class="bi bi-camera-video me-2 d-flex"
    viewBox="0 0 16 16">
    <path fill-rule="evenodd"
        d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z" />
</svg>`,

    close: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
    fill="currentColor" class="bi bi-camera-video-off me-2 d-flex" viewBox="0 0 16 16">
    <path fill-rule="evenodd"
        d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l.714 1H9.5a1 1 0 0 1 1 1v6a1 1 0 0 1-.144.518l.605.847zM1.428 4.18A.999.999 0 0 0 1 5v6a1 1 0 0 0 1 1h5.014l.714 1H2a2 2 0 0 1-2-2V5c0-.675.334-1.272.847-1.634l.58.814zM15 11.73l-3.5-1.555v-4.35L15 4.269v7.462zm-4.407 3.56-10-14 .814-.58 10 14-.814.58z" />
</svg>`
  }

  const FPS = 140 // 20 framesper second

  socket.on('connect', () => {
    $('#feed-tog-cam').attr('disabled', '')
    $('#feed-copy').attr('disabled', '')
    $('#hide-cam-over').hide()

    socket.on('image-ready', (data, raw) => {
      copyAble = raw
      $('.asC-container').css('color', $('#fore-color').val())
      $('.asC-container').css('background-color', $('#back-color').val())
      $('.asC-container').css('font-size', `${$('#range-fSize').val()}px`)
      $('.asC-container').css('line-height', `${$('#range-lHeight').val()}px`)
      $('.asC-container').css('letter-spacing', `${$('#range-chSpace').val()}em`)
      $('.asC-container').html(data)
    })

    var count = 0
    // send image to server
    var capImage = setInterval(() => {
      var resolution = $('#range-reso').val()
      if (resolution != prevReso) {
        if (resolution < prevReso) {
          const context = canvas.getContext('2d')
          context.clearRect(0, 0, canvas.width, canvas.height)
        }
        prevReso = resolution
      }
      canvas.getContext('2d').drawImage(vidElm, 0, 0, prevReso, prevReso)
      var dataURL = canvas.toDataURL('image/png')

      // console.log(dataURL)
      // if (count >= 5) clearInterval(capImage)
      // count++
      socket.emit('process-img', dataURL, $('#range-contrast').val(), prevReso) // send data URL to server
    }, 2000 / FPS)
  })

  $('#feed-stop').click(() => {
    if (MediaStream != null) {
      // $('#vid-frame').show()
      $('#btn-cam-tog-icon').html(camico['close'])
      $('#btn-cam-tog-text').html('HIDE CAMERA')
      togVal = 0

      $('#feed-tog-cam').attr('disabled', '')
      $('#feed-copy').attr('disabled', '')
      MediaStream.stop()
      $('#feed-prompter').fadeIn(300, () => {})
    }
  })

  $('#feed-strt').click(() => {
    $('#feed-prompter').fadeOut(300, () => {
      $('#feed-tog-cam').removeAttr('disabled')
      $('#feed-copy').removeAttr('disabled')
      getUserMedia(constraints, mediaController)
      $('#feed-prompter').hide()
    })
  })

  var togVal = 0
  $('#feed-tog-cam').click(() => {
    $('#btn-cam-tog-icon').html(togVal ? camico['close'] : camico['open'])
    $('#btn-cam-tog-text').html(togVal ? 'HIDE CAMERA' : 'SHOW CAMERA')
    console.log(togVal)
    if (togVal == 1) {
      // hide cam
      $('#hide-cam-over').fadeOut()
      togVal = 0
    } else {
      // show cam
      $('#hide-cam-over').fadeIn()
      togVal++
    }
  })
  
  $('#feed-copy').click(() => {
    navigator.clipboard.writeText(copyAble);
    alert("Code was copied successfully!")
  })
})()
