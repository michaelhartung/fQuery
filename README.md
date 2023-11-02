# fQuery - Fmod Console Library

## Why?

The goal of `fQuery` is to leverage the [FMOD Scripting
API](https://www.fmod.com/docs/2.02/studio/scripting-api-reference.html) and
make working with the built in javascript console a viable option to manage
larger FMOD projects.

If you're my age and have done any web development, you might remember
[jQuery](https://jquery.com/), which loosely inspired this project.

I wanted a way to lookup and modify FMOD objects like events, instruments etc.
from the console. FMOD supports batch editing by selecting multiple events and
instruments to some degree, but if for instance want to add random volume
modulation to all MultiSounds within a selection of events you're out of luck.

This is what `fQuery` _tries_ to solve.

While functionality like the above is implemented and working, the whole
endeavour gets pretty open ended when you start thinking about all the other
possibilites. 

For instance doing things with effect chains, or filter based on tags, setting
track panning or batch copying automations etc. you get the idea.

In that sense, `fQuery` is quite _incomplete_ right now.

I've been working on this on and off since end of 2022, but only if time and
interest align. 

Please don't expect a constant stream of improvements.

**Disclaimer:**

I don't particularly enjoy programming in pre 2015 style javascript these days,
but that's what the FMOD js runtime supports.

If you think any or all of the js code you see in the code base is cursed,
you're probably right :). 

Looking up how things have been done in javascript +8 years ago makes the whole
endeavour all the more tedious.

## Installation

To install `fQuery` either clone this repository into either FMOD's global or
project `Scripts` folder and make sure to reload the scripts (or restart FMOD).

## Usage

The main concept behind `fQuery` is to provide chainable function calls acting
on all FMOD Objects witin the current editor selection.

**Example:**
```shell
> fQueryMultiSound().count()
> 25
> fQueryMultiSound().addRandomizer('volume', 10)
```

### Querying Object Instances

Before using any of the following functions you must select `>1` events or event
folders or banks. Except for `fQueryHelp()`, all of the following functions
return a `fQuery` object with additional available methods.

If you're unsure if a Query found any objects use the `count()` method to verify
you have sth. to work on.

### Queries 

`fQuery` adds the following query functions to the global namespace in
alphabetical order:

#### fQueryHelp()

Prints the fQuery help text to the console.

#### Shared Methods 

The following methods are available for all queried objects.

| functions | description |
| --- | --- |
| get(index) | return selected object at index |
| dump(index) | calls dump() on selected object at index |
| each(function(obj) { //code }) | call function on all selected objects |

#### Meta Methods

These are available for most of the queried objects.

| functions | description |
| --- | --- |
| color() | string[] of colors of selected objects |
| setColor(color) | set color of seletect objects |
| name() | string[] of names of selected objects |
| setName(name) | set name of selected objects |

#### fQueryEvent()

All selected events.

| functions | description |
| --- | --- |
| path() | log the path of the selected events |
| setEventMacros({object}) | set multiple event macros at once |
| setPersistent(boolean) | |
| setDoppler(boolean, 0...100) | enable/disable doppler and set optional dopplerScale |
| setDopplerScale(0-100) | |
| setMaxInstances(0-65) | sets maxInstances, >64 = infinite |
| setPitch(-24...24) | |
| setVolume(-80...10) | |
| setVoiceStealing(0...4) | |
| setPriority(0...4) | |
| setCooldown(0...60000) | |
| setMinDistance(0...10000) | |
| setMaxDistance(0...10000) | |
| uiMacros() | shows a dialogue for setting event macros |

#### fQueryFolder()

Gets all Folders in selection.

#### fQueryActionSheet()

Gets all ActionSheets within selection.

#### fQueryTimeline()

Gets all Timelines within selection.

| functions | description |
| --- | --- |
| markers(?markerType) | returns all markers (TransitionMarker, NamedMarker, TempoMarker) |
| regions(?regionType) | returns all region (TransitionRegion, LoopRegion) | 

#### fQuerySingleSound(), fQueryMultiSound(), fQueryEventSound(),  fQueryScatterer

Queries objects matching the specified Sound Type.

| functions | description |
| --- | --- |
| volume() | logs the volume of all selected sounds |
| setVolume(-80...10) | set the volume of all selected sounds |
| pitch() | logs the pitch of all selected sounds |
| setPitch(-24...24) | set the pitch of all selected sounds |

#### Modulators

Modulator related functions are available for Events and all Sound Types.

All of these return an `fQuery` object with selected/added modulators.

Supported properties for now are `volume`, `pitch`, `startOffset`.

| functions | description |
| --- | --- |
| modulator(propertyName) | fQuery object of modulators, optionally filtered by modulated property |
| addModulator(type, property) | add Modulator of a given type and property |
| randomizer(?property) | fQuery object of RandomizerModulators for an optional property |
| addRandomizer(property) | add a Randomizer for a given property to all selected objects |
| adsr(?property) | fQuery object of ADSRModulators for an optional property |
| addAdsr(property) | add a ADSRModulator for a given property to all selected objects |
| lfo(?property) | fQuery object of LFOModulators for an optional property |
| addLfo(property) | add a LFOModulator for a given property to all selected objects |
| sidechain(?property) | fQuery object of SidechainModulators for an optional property |
| addSidechain(property) | add a SidechainModulator for a given property to all selected objects |
| setAmount(amount) | sets the amount of all selected modulators |

#### fQueryBank()

Gets all selected banks.

| functions | description |
| --- | --- |
| eventCount() | log event count of seleced banks | 
| getPath() | log path of selected banks | 
| events() | returns fQueryObject all events in selected banks | 
| build([platforms]) | build selected banks for given platforms |

## Globals

`fquery.js` adds a couple of _constants_ to the global namespace like colors, priority and voice stealing.

**Priority:**
- `PRIORITY_LOWEST`
- `PRIORITY_LOW`
- `PRIORITY_MEDIUM`
- `PRIORITY_HIGH`
- `PRIORTIY_HIGHEST`

**Voice Stealing:**
- `VOICE_STEALING_OLDEST`
- `VOICE_STEALING_QUIETEST`
- `VOICE_STEALING_VIRTUALIZE`
- `VOICE_STEALING_NONE`
- `VOICE_STEALING_FURTHEST`

**Colors:**
- `COLOR_BLUE`
- `COLOR_BLUE_LIGHT_1`
- `COLOR_BLUE_LIGHT_2`
- `COLOR_PURPLE`
- `COLOR_PURPLE_LIGHT_1`
- `COLOR_PURPLE_LIGHT_2`
- `COLOR_MAGENTA`
- `COLOR_MAGENTA_LIGHT_1`
- `COLOR_MAGENTA_LIGHT_2`
- `COLOR_RED`
- `COLOR_RED_LIGHT_1`
- `COLOR_RED_LIGHT_2`
- `COLOR_YELLOW`
- `COLOR_YELLOW_LIGHT_2`
- `COLOR_YELLOW_LIGHT_2`
- `COLOR_GREEN`
- `COLOR_GREEN_LIGHT_1`
- `COLOR_GREEN_LIGHT_2`
- `COLOR_CYAN`
- `COLOR_CYAN_LIGHT_1`
- `COLOR_CYAN_LIGHT_2`
                 
## UI            
                 
Modifying Event Macros of selected events like Voice Stealing etc. is also
possible via graphical user interfaces available in the menu under
`Scripts->fQuery`.

I added these mainly as showcase and to check whether it's possible so in a nice
way from within the library.

## Examples

### Add Random Volume Modulator to MultiSounds in selection

```shell
> fQueryMultiSound().addRandomizer('volume', 10.0)
```

### Add Random Pitch Modulator to MultiSounds in selection

```shell
> fQueryMultiSound().addRandomizer('pitch', 2)
```

### Run a custom function over all selected events

```shell
> fQueryEvents().each(function(event) { studio.system.print(event.name); })
```

## Scripting

You can use `fquery/core.js` or `fquery.js` in your own scripts.

**Example:**

`Scripts/myscript.js`

```js
var fQuery = studio.system.require('fquery/core.js')

this.myScript = function()
{
    var f = new fQuery()
    var events = f.FindObjectsByType('Event')
    events.each(function(event) {
        studio.system.print(event.id)
    })
}
```

## Ideas / ToDos
 - [ ] filter queries by tag
 - [ ] csv data export
 - [ ] bulk audio file import and event creation using template events
 - [ ] helpers for managing track automations
 - [ ] ...

## Bugs / Issues / Contributions / Ideas

**Note:** I'm only working on this project when time and interest align.

Please report bus / issues via the issue tracker.

If you provide a fix or new feature I will try to merge it in as soon as I get
the chance.

All contribututions to improve `fQuery` are of course welcome!

## License

fQuery is licensed under the [MIT License](https://opensource.org/license/mit/).
