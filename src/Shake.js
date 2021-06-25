let shakingElements = [];
const numberOfShakes = 15;

function shake(element, magnitude = 8) {

    let tiltAngle = 1;
    let shakeCounter = 1;

    let startX = 0,
        startY = 0,
        startAngle = 0;

    // Divides the magnitude into 10 units to reduce the amount of shake by 10 percent each frame
    let magnitudeUnit = magnitude / numberOfShakes;

    // Add the element to an array of elements that are being shook
    if (shakingElements.indexOf(element) === -1) {
        shakingElements.push(element);
        upAndDownShake();
    }

    function upAndDownShake() {

        if (shakeCounter < numberOfShakes) {

            // Reset the element's position at the start of each shake
            element.style.transform = 'translate(' + startX + 'px, ' + startY + 'px)';

            magnitude -= magnitudeUnit;

            let randomX = randomNumber(-magnitude, magnitude);
            let randomY = randomNumber(-magnitude, magnitude);

            element.style.transform = 'translate(' + randomX + 'px, ' + randomY + 'px)';

            shakeCounter += 1;
            requestAnimationFrame(upAndDownShake);
        }

        // Restores the element to its original translation
        if (shakeCounter >= numberOfShakes) {
            element.style.transform = 'translate(' + startX + ', ' + startY + ')';
            shakingElements.splice(shakingElements.indexOf(element), 1);
        }
    }
};