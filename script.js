document.getElementById("encodeButton").addEventListener("click", function () {
  const coverImage = document.getElementById("coverImage").files[0];
  const message = document.getElementById("message").value.trim();

  if (!coverImage || !message) {
    alert("Masukkan gambar dan pesan yang ingin disisipkan.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const binaryMessage = messageToBinary(message + "\0"); // Add null character to end of message
      if (binaryMessage.length > data.length / 4) {
        alert("Pesan terlalu panjang untuk disisipkan dalam gambar ini.");
        return;
      }

      let messageIndex = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (messageIndex < binaryMessage.length) {
          data[i] = (data[i] & 0xfe) | parseInt(binaryMessage[messageIndex], 2);
          messageIndex++;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const encodedImageURL = canvas.toDataURL();
      document.getElementById("encodedImage").src = encodedImageURL;
      document.getElementById("result").style.display = "block";
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(coverImage);
});

document.getElementById("decodeButton").addEventListener("click", function () {
  const encodedImage = document.getElementById("encodedImageInput").files[0];

  if (!encodedImage) {
    alert("Masukkan gambar yang mengandung pesan.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const binaryMessage = [];
      for (let i = 0; i < data.length; i += 4) {
        binaryMessage.push(data[i] & 1);
      }

      const message = binaryToMessage(binaryMessage);
      document.getElementById("decodedMessage").value = message;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(encodedImage);
});

function messageToBinary(message) {
  let binary = "";
  for (let i = 0; i < message.length; i++) {
    const binaryChar = message[i].charCodeAt(0).toString(2).padStart(8, "0");
    binary += binaryChar;
  }
  return binary;
}

function binaryToMessage(binaryArray) {
  let message = "";
  for (let i = 0; i < binaryArray.length; i += 8) {
    const byte = binaryArray.slice(i, i + 8).join("");
    const char = String.fromCharCode(parseInt(byte, 2));
    if (char === "\0") break; // Stop at null character
    message += char;
  }
  return message;
}
