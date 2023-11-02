// 2023 Michael Hartung <michael@hartung.studio>

var fQuerySound = {}

//------------------------------------------------------------------------------

/**
 * Returns help string
 * @returns {string}
 */
fQuerySound.help = function () {
    var help = '\n\n'
        + ' ----------------------------------- \n'
        + ' Sound \n'
        + ' ----------------------------------- \n\n'
        + ' volume()                            logs the volume of all selected sounds\n'
        + ' setVolume(-80...10)                 set the volume of all selected sounds\n'
        + ' pitch()                             logs the pitch of all selected sounds\n'
        + ' setPitch(-24...24)                  set the pitch of all selected sounds\n'
    return help
}

//------------------------------------------------------------------------------

/**
 * Logs the volume of all selected sounds
 * @returns {fQuery}
 */
fQuerySound.volume = function () {
    var self = this

    self.each(function (sound) {
        if (sound.properties.hasOwnProperty('volume')) {

            var name = sound.properties.name.value
            var volume = sound.properties.volume.value

            if (name !== undefined && name !== '') {
                self._logInfo('{0}: {1}db'.format(name, volume))
            } else {
                self._logInfo('{0}: {1}db'.format(sound.entity, volume))
            }
        }
    })

    return this
}

//------------------------------------------------------------------------------

/**
 * Sets the volume of all selected sounds
 * @param {number} volume 
 * @returns {fQuery}
 */
fQuerySound.setVolume = function (volume) {
    volume = this.clamp(volume, this._fmod.SOUND_MIN_VOLUME, this._fmod.SOUND_MAX_VOLUME)
    this.setProperty('volume', volume)
    return this
}

//------------------------------------------------------------------------------

/**
 * Logs the pitch of all selected sounds 
 * @returns {fQuery}
 */
fQuerySound.pitch = function () {
    var self = this
    self.each(function (sound) {
        if (sound.hasOwnProperty('pitch')) {
            var pitch = sound.pitch / self._fmod.SEMITONE
            if (sound.name !== undefined && sound.name !== '') {
                self._logInfo('{0}: {1}st'.format(sound.name, pitch))
            } else {
                self._logInfo('{0}: {1}st'.format(sound.entity, pitch))
            }
        }
    })

    return this
}

//------------------------------------------------------------------------------

/**
 * Sets the pitch of all selected sounds
 * @param {number} pitch 
 * @returns {fQuery}
 */
fQuerySound.setPitch = function (pitch) {
    pitch = this.clamp(pitch, this._fmod.SOUND_MIN_PITCH, this._fmod.SOUND_MAX_PITCH)
    this.setProperty('pitch', pitch)
    return this
}

//------------------------------------------------------------------------------
module.exports = fQuerySound
