define(
  'ephox.darwin.keyboard.Retries',

  [
    'ephox.darwin.keyboard.Rectangles',
    'ephox.fussy.api.Point',
    'ephox.perhaps.Option',
    'global!Math'
  ],

  function (Rectangles, Point, Option, Math) {
    var JUMP_SIZE = 5;
    /*
     * This isn't right ... but let's just hook it up first.
     */

    var mogel = function (win, guessBox, caret) {
      // We haven't dropped vertically, so we need to look down and try again.
      if (guessBox.bottom === caret.bottom) return webkitAgain(win, { left: caret.left, bottom: caret.bottom + JUMP_SIZE });
      // The returned guessBox based on the guess actually doesn't include the initial caret. So we search again
      // where we adjust the caret so that it is inside the returned guessBox. This means that the offset calculation
      // will be more accurate.
      else if (guessBox.top > caret.bottom) return Point.find(win, caret.left, guessBox.top + 1);
      // We couldn't find any better way to improve our guess.
      else return Option.none();
    };

    var sameBottom = function (guessBox, caret) {
      return guessBox.bottom === caret.bottom;
    };

     // In Firefox, it isn't giving you the next element ... it's giving you the current element. So if the box of where it gives you has the same y value
    // minus some error, try again with a bigger jump.
    var firefoxAgain = function (win, caret, _adjustedCaret) {
      var adjustedCaret = _adjustedCaret !== undefined ? _adjustedCaret : caret;
      return Point.find(win, adjustedCaret.left, adjustedCaret.bottom + JUMP_SIZE).bind(function (guess) {
        return guess.start().fold(Option.none, function (e, eo) {
          console.log('e: ', e.dom());
          return Rectangles.getBox(win, e, eo).bind(function (guessBox) {
            if (sameBottom(guessBox, caret)) return firefoxAgain(win, caret, { left: adjustedCaret.left, bottom: adjustedCaret.bottom + JUMP_SIZE, top: adjustedCaret.top + JUMP_SIZE });
            return mogel(win, guessBox, caret);
          }).orThunk(function () {
            return Option.some(guess);
          });
        }, Option.none);
      });
    };

    // The process is that you incrementally go down ... if you find the next element, but your top is not at that element's bounding rect.
    // then try again with the same x but the box's y
    var webkitAgain = function (win, caret) {
      return Point.find(win, caret.left, caret.bottom + JUMP_SIZE).bind(function (guess) {
        return guess.start().fold(Option.none, function (e, eo) {
          return Rectangles.getBox(win, e, eo).bind(function (guessBox) {
            return mogel(win, guessBox, caret).orThunk(function () {
              return Option.some(guess);
            });
          });
        }, Option.none);
      });
    };

    var ieAgain = function (win, caret) {
      return Point.find(win, caret.left, caret.bottom + 5);
    };


    return {
      webkitAgain: webkitAgain,
      firefoxAgain: firefoxAgain,
      ieAgain: ieAgain
    };
  }
);