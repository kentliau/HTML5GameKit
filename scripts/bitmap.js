// bitmap.js
(function (document, app) {

    // this class is for drawing an image to a canvas
    function Bitmap(image) {
        this.image = image;
        this.width = image.width;
        this.height = image.height;
        this.anchorX = 0.5;
        this.anchorY = 0.5;
        this.alpha = 1;
    }

    // the anchor point specifies how an image is drawn at a given location. 
    // the default anchor of 0.5, 0.5 tells the image to be drawn from the center
    Bitmap.prototype.setAnchor = function(anchorX, anchorY){
        this.anchorX = anchorX;
        this.anchorY = anchorY;
    };

    // This is the main draw method to use when you have a transform.
    Bitmap.prototype.draw = function (ctx, transform, blendMode) {
        this.drawNoTransform(ctx, transform.position.x, transform.position.y, transform.rotation, transform.scale.x, transform.scale.y, blendMode);
    };

    // This method draws an image at the specified transform values
    Bitmap.prototype.drawNoTransform = function (ctx, x, y, rotation, scaleX, scaleY, blendMode) {
        ctx.save();
        ctx.globalAlpha *= this.alpha;
        if (ctx.globalAlpha > 0){

            if (blendMode) {
                ctx.globalCompositeOperation = blendMode;
            }

            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.scale(scaleX, scaleY);
            ctx.drawImage(this.image, this.width * -this.anchorX, this.height * -this.anchorY, this.width, this.height);      
        }
        ctx.restore();
    };

    app.util.Bitmap = Bitmap;

}(document, app));