// 2023 Michael Hartung <michael@hartung.studio>

// adsr modulator with setting attack decay release etc.
// lfo modulator with settings (depth, rate, shape, phase)

var fQueryModulator = {}

//------------------------------------------------------------------------------

fQueryModulator.help = function () {
    var help = '\n\n'
        + ' ----------------------------------- \n'
        + ' Modulator \n'
        + ' ----------------------------------- \n\n'
        + ' modulator(propertyName)             fQuery object of modulators, optionally filtered by modulated property\n'
        + ' addModulator(type, property)        add Modulator of a given type and property\n\n'
        + ' randomizer(?property)               fQuery object of RandomizerModulatorsfor an optional property \n'
        + ' addRandomizer(property)             add a Randomizer for a given property to all selected objects\n\n'
        + ' adsr(?property)                     fQuery object of ADSRModulators for an optional property \n'
        + ' addAdsr(property)                   add a ADSRModulator for a given property to all selected objects\n\n'
        + ' lfo(?property)                      fQuery object of LFOModulators for an optional property \n'
        + ' addLfo(property)                    add a LFOModulator for a given property to all selected objects\n\n'
        + ' sidechain(?property)                fQuery object of SidechainModulators for an optional property\n'
        + ' addSidechain(property)              add a SidechainModulator for a given property to all selected objects\n\n'
        + ' setAmount(amount)                   sets the amount of all selected modulators\n'
    return help
}

//------------------------------------------------------------------------------

/**
 * Checks if a given modulatorType is valid 
 * @param {string} modulatorType 
 * @returns {bool}
 */
fQueryModulator._isValidModulator = function (modulatorType) {
    var modulatorTypes = ['RandomizerModulator', 'LFOModulator', 'ADSRModulator', 'SidechainModulator']

    if (arguments.length === 0) {
        this._logError('ArgumentsError', 'function requires a valid ModulatorType')
        this._logError('AvailableTypes: {0}'.format(modulatorType.join(', ')))
        return false
    }

    for (var i = 0; i < modulatorTypes.length; i++) {
        if (modulatorTypes[i] === modulatorType) {
            return true
        }
    }

    this._logError('TypeError', 'invalid ModulatorType {0}'.format(modulatorType))
    return false
}

//------------------------------------------------------------------------------

/**
 * Checks if the given propertyName is valid
 * @param {string} propertyName 
 * @returns {bool}
 */
fQueryModulator._isValidModulatorProperty = function (propertyName) {
    if (arguments.length === 0) {
        this._logError('ArgumentsError', 'function requires a propertyName')
        return false
    } else {
        return true
    }
}

//------------------------------------------------------------------------------

/**
 * Returns a fQuery Object of Modulators optionally filters by modulators by 
 * propertyName
 * @param {string} propertyName 
 * @returns {fQuery}
 */
fQueryModulator.modulator = function (propertyName) {
    var modulators = []

    this.each(function (obj) {
        // studio.project.model.Modulator.findInstances({
        //     searchContext: obj,
        //     includeDerivedTypes: true
        // })
        if (obj.hasOwnProperty('modulators')) {
            modulators = modulators.concat(obj.modulators)
        }
    })

    if (propertyName !== undefined) {
        this._setObjects(
            modulators.filter(function (modulator) {
                return modulator.nameOfPropertyBeingModulated == propertyName
            })
        )
    } else {
        this._setObjects(modulators)
    }

    return this
}

//------------------------------------------------------------------------------

/**
 * Clear all modulators, or for a given modulated property
 * @param {string} propertyName 
 * @returns {fQuery}
 */
fQueryModulator.clearModulator = function (propertyName) {
    if (propertyName === undefined) {
        this.each(function (obj) {
            if (obj.hasOwnProperty('modulators')) {
                obj.modulators.forEach(function (modulator) {
                    obj.relationships.modulators.remove(modulator)
                })
            }
        })
    } else {

        if (!this._isValidModulatorProperty(propertyName)) {
            return this
        }

        this.each(function (obj) {
            if (obj.hasOwnProperty('modulators')) {
                obj.modulators.forEach(function (modulator) {
                    if (modulator.nameOfPropertyBeingModulated == propertyName) {
                        // TODO(mhartung) this invalidates the project, unsure if there's a way to remove modulators 
                        obj.relationships.modulators.remove(modulator)
                    }
                })
            }
        })
    }

    return this
}

//------------------------------------------------------------------------------

/**
 * Adds a modulator of modulatorType for a given property with an optional amount 
 * to all selected objects
 * @param {string} modulatorType 
 * @param {string} propertyName 
 * @param {number} amount 
 * @returns {fQuery}
 */
fQueryModulator._addModulator = function (modulatorType, propertyName, amount) {
    amount = amount || 0

    if (!this._isValidModulator(modulatorType)) {
        return this
    }

    if (propertyName === undefined) {
        this._logError('ParamError', '_addModulator requires a propertyName')
    }

    var self = this
    var modulators = []

    self.each(function (object) {

        if (typeof (object.addModulator) === undefined) {
            self._logError('PropertyError', 'has no function addModulator')
            return
        }

        if (!object.hasOwnProperty(propertyName)) {
            self._logError('PropertyError', 'has no property {0}'.format(propertyName))
            return
        }

        var modulator = object.addModulator(modulatorType, propertyName)

        if (amount !== 0
            && (modulatorType === 'RandomizerModulator' || modulatorType === 'SidechainModulator')) {
            switch (propertyName) {
                case 'volume':
                    modulator.properties.amount.setValue(self.clamp(amount, 0, self._fmod.MODULATOR_MAX_VOLUME))
                    break
                case 'pitch':
                    modulator.properties.amount.setValue(self.clamp(amount, 0, self._fmod.MODULATOR_MAX_PITCH) * self._fmod.SEMITONE)
                    break
                case 'startOffset':
                    modulator.properties.amount.setValue(self.clamp(amount, 0, 100))
                    break
            }
        }

        modulators.push(modulator)
    })

    self._setObjects(modulators)
    return self
}

//------------------------------------------------------------------------------

/**
 * Initializes all modulators with a given template object or default values
 * @param {string} modulatorType 
 * @param {ManagedObject} template 
 * @returns {fQuery}
 */
fQueryModulator._initModulator = function (template, modulatorType) {
    var self = this
    defaultProperties = self._fmod.PROPERTIES[modulatorType]

    if (template !== undefined
        && typeof (template.isOfExactType) === 'function'
        && template.isOfExactType(modulatorType)) {
        defaults = template
    }
    else {
        defaultProperties.forEach(function (property) {
            if (studio.project.model[modulatorType].properties.hasOwnProperty(property)) {
                var defaultValue = studio.project.model[modulatorType].properties[property].defaultValue
                self.each(function (obj) {
                    obj.properties[property].setValue(defaultValue)
                })
            }
        })
    }

    return self
}

//------------------------------------------------------------------------------

/**
 * Returns a fQueryObject of RandomizerModulators for a given property
 * @param {string} propertyName 
 * @returns {fQuery}
 */
fQueryModulator.randomizer = function (propertyName) {
    this.modulator(propertyName)
    this._objects = this._filterObjectsByExactType(this._objects, 'RandomizerModulator')
    return this
}

//------------------------------------------------------------------------------

/**
 * Adds a Randomizer for a given property with an optional amount to all 
 * selected objects
 * @param {string} propertyName 
 * @param {number} amount 
 * @returns {fQuery}
 */
fQueryModulator.addRandomizer = function (propertyName, amount) {
    return this._addModulator('RandomizerModulator', propertyName, amount)
}

//------------------------------------------------------------------------------

/**
 * Returns a fQueryObject of ADSRModulators for a given property
 * @param {string} propertyName 
 * @returns {fQuery}
 */
fQueryModulator.adsr = function (propertyName) {
    this.modulator(propertyName)
    this._objects = this._filterObjectsByExactType(this._objects, 'ADSRModulator')
    return this
}

//------------------------------------------------------------------------------

/**
 * Adds an ADSRModulator for the given property, using an optional template object
 * of type ADSRMoodulator to set the defaults
 * @param {string} propertyName 
 * @param {ManagedObject<ADSRModulator>} template 
 * @returns {fQuery}
 */
fQueryModulator.addAdsr = function (propertyName, template) {
    this._addModulator('ADSRModulator', propertyName)
    this._initModulator(template, 'ADSRModulator')
    return this
}

//------------------------------------------------------------------------------

/**
 * Returns a fQueryobject of LFOModulators for a given property
 * @param {string} propertyName 
 * @returns {fQuery}
 */
fQueryModulator.lfo= function (propertyName) {
    this.modulator(propertyName)
    this._objects = this._filterObjectsByExactType(this._objects, 'LFOModulator')
    return this
}

//------------------------------------------------------------------------------

/**
 * Adds a LFOModulator for a given property with an optional amount to all 
 * selected objects
 * @param {string} propertyName 
 * @param {number} amount 
 * @returns {fQuery}
 */
fQueryModulator.addLfo = function (propertyName, template) {
    this._addModulator('LFOModulator', propertyName)
    this._initModulator(template, 'LFOModulator')
    return this
}

//------------------------------------------------------------------------------

/**
 * Returns a fQueryobject of SidechainModulators for a given property
 * @param {string} propertyName 
 * @returns {fQuery}
 */
fQueryModulator.sidechain = function (propertyName) {
    this.modulator(propertyName)
    this._objects = this._filterObjectsByExactType(this._objects, 'SidechainModulator')
    return this
}

//------------------------------------------------------------------------------

/**
 * Adds a SidechainModulator for a given property with an optional amount to all 
 * selected objects
 * @param {string} propertyName 
 * @param {number} amount 
 * @returns {fQuery}
 */
fQueryModulator.addSidechain = function (propertyName, template) {
    this._addModulator('SidechainModulator', propertyName)
    this._initModulator(template, 'SidechainModulator')
    return this
}

//------------------------------------------------------------------------------

/**
 * Sets the modulation amount for a given parameter on all selected modulators
 * @param {string} propertyName 
 * @param {number} amount 
 * @returns {fQuery}
 */
fQueryModulator.setAmount = function (amount) {
    var self = this

    self.each(function (modulator) {
        if (modulator.properties.hasOwnProperty('amount')) {
            var propertyName = modulator.nameOfPropertyBeingModulated

            switch (propertyName) {

                case 'volume':
                    amount = self.clamp(amount, 0, self._fmod.MODULATOR_MAX_VOLUME)
                    modulator.properties.amount.setValue(amount)
                    break

                case 'pitch':
                    amount = self.clamp(amount, 0, self._fmod.MODULATOR_MAX_PITCH) * self._fmod.SEMITONE
                    modulator.amount.setValue(amount)
                    break

                case 'startOffset':
                    amount = self.clamp(amount, 0, 100)
                    modulator.amount.setValue(amount)
                    break
            }
        }
    })

    return this
}

//------------------------------------------------------------------------------

module.exports = fQueryModulator
