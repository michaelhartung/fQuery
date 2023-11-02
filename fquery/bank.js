// 2023 Michael Hartung <michael@hartung.studio>

var fQueryBank = {}

//------------------------------------------------------------------------------

/**
 * Returns the help string
 * @returns {string} help
 */
fQueryBank.help = function () {
    var help = '\n\n'
        + ' ----------------------------------- \n'
        + ' Bank \n'
        + ' ----------------------------------- \n\n'
        + ' eventCount()                        log event count of seleced banks\n'
        + ' getPath()                           log path of selected banks\n'
        + ' events()                            returns fQueryObject all events in selected banks\n'
        + ' build([platforms])                  build selected banks for given platforms\n'
    return help
}

//------------------------------------------------------------------------------

/**
 * Logs event count of selected banks
 * @returns {fQuery}
 */
fQueryBank.eventCount = function () {
    var self = this
    self.each(function (bank) {
        self._logInfo('Number of Events [{0}]: {1}'.format(bank.name, bank.events.length))
    })

    return self
}

//------------------------------------------------------------------------------

/**
 * Logs the path of all selected banks
 * @returns {fQuery}
 */
fQueryBank.getPath = function () {
    var self = this
    var path = []

    self.each(function (bank) {
        self._logInfo('Path of [{0}]: {1}'.format(bank.name, bank.getPath()))
    })

    return self
}

//------------------------------------------------------------------------------

/**
 * Returns fQuery Object for all events in selected banks
 * @returns {fQuery} fQueryObject
 */
fQueryBank.Events = function () {
    var events = []

    this.each(function (bank) {
        events = events.concat(bank.events)
    })

    this._setObjects(events)

    this._addExtensions({
        extensions: ['fQueryEvent', 'fQueryMeta', 'fQueryModulator'],
        clearExtensions: true
    })

    return this
}

//------------------------------------------------------------------------------

/**
 * Builds banks for selected banks for specified platforms
 * @param {string[]} platforms - array of platforms to build
 * @returns {fQuery}
 */
fQueryBank.build = function (platforms) {
    platforms = platforms || ['Desktop']

    var self = this

    self.each(function (bank) {
        studio.project.build({ banks: bank.name, platforms: platforms })
    })

    return self
}

//------------------------------------------------------------------------------

module.exports = fQueryBank
