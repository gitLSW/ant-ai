const MAX_POINTS = 20
function getPointsForType(type) {
    switch (type) {
        case 'Resource':
            return MAX_POINTS;
        case 'Spider':
            return -10;
        default:
            return 0;
    }
}

module.exports = { MAX_POINTS, getPointsForType }