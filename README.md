### TO DO:

- clickable buttons with with keys indicators for all input funcionalities
- points counter
- idea for how exostion from player's ship engines should look like and implementing this
- interactive tutorial (instead of images) with "next" and "previous" buttons and dot navigation below description in frame in the middle of the screen and arrow that shows currently described funcionality
- canons and ability to destroy drones
- canons and infinite shield for orbital station
- allert messages (HTML?):
  - gravitational pull (when gravity force is stronger than engines force)
  - collision allert
  - fuel low
  - out of fuel
- ~~copy out of focus tab functionality from ants and turn on pause when it happens~~
- ~~fix: camera not focusing on current screen center when zooming in free camera mode~~
- ~~you died screen~~
- ~~images based on svg paths for player, orbital station & drones~~

### Ideas:

- click on object for the camera to follow it
- idea for speed meeter and other ui elements
- add vector throttle viz or meeter
- change single ships engine trail to four small engines
- place black hole in the background and replace it with red dwarf!
- setting that allows player to tweak gravity alert sensitivity
- aim & pew pew! lots of pew pew!
- use parts from the alien ships to upgrade your ship:
  - probes: force field pulling red matter parts
  - scouts: energy shields parts
  - bombers: hull reinforcement parts
- player ship has shields!
- separate auto pew pew on short distances
- local civilisation that lives on the furthest planet, that will treat player as aliens and try to shoot him :D

  - their planet will have space station on its orbit, player can try destory it but their shields will regenerate so fast it won't be possible
  - ships starting from planet
  - two types of ships:
    - red matter collectors (no weapons, just stilling red matter from player :D)
      - if three are destroyed in row without letting any back to home planet armed ships will be deployed
    - armed ships:
      - scouts (periodically lunched for patrol)
      - battleships, that will fuck the player and make him cry

- out of viewport markers/arrows showing direction, distance and name of bodies out of screen
- dialogs?
- animations?
- planets moons
- name, speed etc annotations for each body
- ? (hight resolutions render tiny stars)
- min zoom equal to value allowing player to see entire solar system in his viewport
- turning left or right might be damaged
- intro: armada with large ship chasing The Fang, that escapes. Expo dialog about stilling
- some shit the empire really can't loose
- damage notifier (image of ship's parts green/orange/red)
  - movement prediction
  - collision detection
- zoom grid, few different paterns of grid depending on zoom level
- info modal with text about options & guide
- use the same style with lines from object to display info like speed, mass, full cicle time etc
- button to turn on/off the above
- option: F - viewport follows player (default on)
- interpolate camera movement

### canvas effects

- [Black Hole Shader!](https://codepen.io/darrylhuffman/pen/gRZrpv?editors=1000)
- [Liquid Lights](https://codepen.io/tmrDevelops/pen/rVNxVQ?editors=0010)
- [Noise Abstraction](https://codepen.io/akm2/pen/nImoa?editors=0010)
- [Lightning](https://codepen.io/akm2/pen/Aatbf?editors=0010)
- [Gravity Black Holes](https://codepen.io/akm2/pen/rHIsa?editors=0010)
- [Lights & Shadows](https://codepen.io/mladen___/pen/gbvqBo?editors=0010)

Dialogs ideas:

- why these probes are not getting pulled by the singularity?
- this is it. Thats our target
- are these planets?
- they circle high above it's north pole, how's that possible
- is that? - yes, red matter - it doesn't seem to obey any physics rules - it has no mass, like light particles,

### Debug Q&A

Q: Is image moving when ration is 1x1?
A: No!

Q: Is image moving when ration is NOT 1x1?
A: Yes, it moves along shorter axis of the viewport.

Q: By how much? If it stretches - in what direction?
A: Stretches up, by about 75% of oryginal size. It also shifts position when zoom is changed.

?? Zoom? What is the relation of zoom and position?

Solution1(S1): Is scaling width and high with viewport size ration changes something?
A: Not if iamges width (same as height in the example) is scaled with ration uniformely
Q: what if ration would be applied only to the shorter side?
A: It solves the streatch!

Q: How much the image is displaced right after start?
A: About -25%.
Q: Is adding 25% of image height as static value to y position fixes displacement?
A: No.

! Viewport offset playes no role in image displacement
! The bigger offset the bigger negative displacement on smaller axis.
! It's not about distortion made by shader fragment but about displacement
that is visible for objects that should stay in place but move
on shorter axis when viewport moves.

Q: How can shorter axis position (y) be modivied to remove displacement?
S1: Add viewport size difference?
Why?: It comes from the fact that the issue is present when viewport width and height are not the same.
A: No.

Q: Is size of the difference of viewport sides makes any difference in displacement size?
A: It does.

Q: How can shorter axis position (y) be modivied to remove displacement?
S1: Add viewport size difference?
Why?: It comes from the fact that the issue is present when viewport width and height are not the same.
A: No.
