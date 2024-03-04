class Texture {
    constructor(path) {
        let that = this
        that.width = 0
        fetch(path)
            .then(response => response.blob())
            .then(blob => createImageBitmap(blob))
            .then(imageBitmap => {
                var canvas = document.createElement('canvas');
                canvas.width = imageBitmap.width;
                canvas.height = imageBitmap.height;

                var context = canvas.getContext('2d');
                context.drawImage(imageBitmap, 0, 0);

                var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                var pixelData = imageData.data;

                var pixelArray = [];
                for (var y = 0; y < canvas.height; y++) {
                    var row = [];
                    for (var x = 0; x < canvas.width; x++) {
                      var index = (y * canvas.width + x) * 4;
                      var red = pixelData[index];
                      var green = pixelData[index + 1];
                      var blue = pixelData[index + 2];
                      var alpha = pixelData[index + 3];
              
                      // 将每个像素的 RGBA 值存储到行数组中
                      row.push((new Vector([red, green, blue, alpha])).MulScale(1 / 255));
                    }
              
                    // 将行数组添加到二维数组中
                    pixelArray.push(row);
                  }
                that.array = pixelArray
                that.width = imageBitmap.width;
                that.height = imageBitmap.height;
                // console.log(that.sample(0.3, 0.5));
            })
            .catch(error => {
                // 处理错误
                console.error(error);
            });

    }
    sample(x, y) {
        if (!this.width) {
            // console.log("未加载");
            return new Vector([1, 0, 1])
        }
        x = x % 1
        y =  (1 -y % 1)

        return bilinearInterpolation(x * this.width, y * this.height, this.array)
    }
}
function bilinearInterpolation(x, y, imageData) {
    // console.log(x);
    var x1 = Math.floor(x);
    var x2 = x1 + 1;
    var y1 = Math.floor(y);
    var y2 = y1 + 1;
    try {
        var p1 = Vector.inter(imageData[y1][x1], imageData[y1][ x2], x - x1);
        var p2 = Vector.inter(imageData[y2][x1], imageData[y2][x2], x - x1);
        return Vector.inter(p1, p2, y - y1)
    } catch (err) {
        // console.log(x,y,imageData);
        return new Vector([1, 0, 0])
    }


}
// let img1 = new Texture('Models/Coins_Normal.png')
