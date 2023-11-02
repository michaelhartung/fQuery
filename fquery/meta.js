// 2023 Michael Hartung <michael@hartung.studio>

var fQueryMeta = {}

//------------------------------------------------------------------------------

/**
 * Returns the help string
 * @returns {string} help
 */
fQueryMeta.help = function () {
    var help = '\n\n'
        + ' -----------------------------------\n'
        + ' Meta \n'
        + ' -----------------------------------\n\n'
        + ' color()                             string[] of colors of selected objects\n'
        + ' setColor(color)                     set color of seletect objects\n'
        + ' name()                              string[] of names of selected objects\n'
        + ' setName(name)                       set name of selected objects\n'
    return help
}

//------------------------------------------------------------------------------

/**
 * Check if a given color string is a valid FMOD color
 * @param {string} color 
 * @returns {boolean} 
 */
fQueryMeta._isValidColor = function (color) {
    var validColors = [
        'Blue', 'Blue Light 1', 'Blue Light 2',
        'Purple', 'Purple Light 1', 'Purple Light 2',
        'Magenta', 'Magenta Light 1', 'Magenta Light 2',
        'Red', 'Red Light 1', 'Red Light 2',
        'Yellow', 'Yellow Light 1', 'Yellow Light 2',
        'Green', 'Green Light 1', 'Green Light 2',
        'Cyan', 'Cyan Light 1', 'Cyan Light 2',
    ]

    var result = false

    validColors.forEach(function (validColor) {
        if (color == validColor) {
            result = true
        }
    })

    return result
}

//------------------------------------------------------------------------------

/**
 * Returns a array of object colors
 * @returns {string[]} - array of colors
 */
fQueryMeta.color = function () {
    return this.property('color')
}

//------------------------------------------------------------------------------

/**
 * Sets object colors to given color
 * @param {string} color 
 * @returns {fQuery}
 */
fQueryMeta.setColor = function (color) {

    if (this._isValidColor(color)) {
        this.setProperty('color', color)
    } else {
        this._logError('ValueError', 'invalid color: {0}'.format(color))
    }

    return this
}

//------------------------------------------------------------------------------

/**
 * Returns an array of object names 
 * @returns {string[]}
 */
fQueryMeta.name = function () {
    return this.property('name')
}

//------------------------------------------------------------------------------

/**
 * Sets all selected objects name
 * @param {string} name 
 * @returns {fQuery}
 */
fQueryMeta.setName = function (name) {
    if (name === undefined) {
        this._logError('ArgumentError', 'missing argument name {string}')
    } else {
        this.setProperty('name', name)
    }

    return this
}

//------------------------------------------------------------------------------

module.exports = fQueryMeta
