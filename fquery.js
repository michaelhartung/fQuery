// 2023 Michael Hartung <michael@hartung.studio>

//------------------------------------------------------------------------------

var fQuery = studio.system.require('fquery/core.js')

//------------------------------------------------------------------------------

this.PRIORITY_LOWEST  = 0
this.PRIORITY_LOW     = 1
this.PRIORITY_MEDIUM  = 2
this.PRIORITY_HIGH    = 3
this.PRIORTIY_HIGHEST = 4

//------------------------------------------------------------------------------

this.VOICE_STEALING_OLDEST      = 0
this.VOICE_STEALING_QUIETEST    = 1
this.VOICE_STEALING_VIRTUALIZE  = 2
this.VOICE_STEALING_NONE        = 3
this.VOICE_STEALING_FURTHEST    = 4

//------------------------------------------------------------------------------

this.COLOR_BLUE             = 'Blue'
this.COLOR_BLUE_LIGHT_1     = 'Blue Light 1'
this.COLOR_BLUE_LIGHT_2     = 'Blue Light 2'
this.COLOR_PURPLE           = 'Purple'
this.COLOR_PURPLE_LIGHT_1   = 'Purple Light 1'
this.COLOR_PURPLE_LIGHT_2   = 'Purple Light 2'
this.COLOR_MAGENTA          = 'Magenta'
this.COLOR_MAGENTA_LIGHT_1  = 'Magenta Light 1'
this.COLOR_MAGENTA_LIGHT_2  = 'Magenta Light 2'
this.COLOR_RED              = 'Red'
this.COLOR_RED_LIGHT_1      = 'Red Light 1'
this.COLOR_RED_LIGHT_2      = 'Red Light 2'
this.COLOR_YELLOW           = 'Yellow'
this.COLOR_YELLOW_LIGHT_2   = 'Yellow Light 1'
this.COLOR_YELLOW_LIGHT_2   = 'Yellow Light 2'
this.COLOR_GREEN            = 'Green'
this.COLOR_GREEN_LIGHT_1    = 'Green Light 1'
this.COLOR_GREEN_LIGHT_2    = 'Green Light 2'
this.COLOR_CYAN             = 'Cyan'
this.COLOR_CYAN_LIGHT_1     = 'Cyan Light 1'
this.COLOR_CYAN_LIGHT_2     = 'Cyan Light 2'

//------------------------------------------------------------------------------
// setup console commands 
//------------------------------------------------------------------------------

this.fQueryHelp     = function () { return new fQuery().help() }

this.fQueryBank     = function () { return new fQuery().FindObjectsByType('Bank') }
this.fQueryEvent    = function () { return new fQuery().FindObjectsByType('Event') }
this.fQueryFolder   = function () { return new fQuery().FindObjectsByType('EventFolder') }

this.fQueryAnySound     = function() { return new fQuery().FindObjectsByType('AnySound', true) }
this.fQuerySingleSound  = function () { return new fQuery().FindObjectsByType('SingleSound') }
this.fQueryMultiSound   = function () { return new fQuery().FindObjectsByType('MultiSound') }
this.fQueryEventSound   = function () { return new fQuery().FindObjectsByType('EventSound') }
this.fQueryScatterer    = function () { return new fQuery().FindObjectsByType('SoundScatterer') }

this.fQueryTimeline     = function () { return new fQuery().FindObjectsByType('Timeline') }
this.fQueryActionSheet  = function () { return new fQuery().FindObjectsByType('ActionSheet') }

//------------------------------------------------------------------------------
// setup menu items
//------------------------------------------------------------------------------

studio.menu.addMenuItem({
    name: "fQuery\\Events\\Macros",
    isEnabled: true,
    execute: function () { fQueryEvent().uiMacros() }
});

studio.menu.addMenuItem({
    name: "fQuery\\Folder\\Events\\Macros",
    isEnabled: true,
    execute: function () { fQueryFolder().Events().uiMacros() }
})