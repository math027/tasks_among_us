$(document).ready(function () {
  startManifolds();

  function showCompletedTask() {
    $('.modal').addClass('modal_show');
    $('.modal').removeClass('hidden');
    setTimeout(function () {
      $('.modal').removeClass('modal_show');
      $('.modal').addClass('hidden');
      startManifolds();
    }, 1500);
  }

  // 
  //    Manifolds
  //
  var manifoldsCounter = 1;
  var manifoldsBlocked = false;

  function startManifolds() {
    manifoldsCounter = 1;
    $('.manifolds__button').remove();
    var mans = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    shuffle(mans);
    mans.forEach(function (item) {
      $('.manifolds__panel').append('<button type="button" class="manifolds__button">' + item + '</button>');
    });
  }

  $(document).on('click', '.manifolds__button', function () {
    if (manifoldsBlocked) return false;
    if (manifoldsCounter != $(this).text()) {
      manifoldsCounter = 1;
      manifoldsBlocked = true;
      $('.manifolds__button_active').removeClass('manifolds__button_active');
      $('.manifolds__panel').addClass('manifolds__panel_wrong');
      setTimeout(function () {
        $('.manifolds__panel_wrong').removeClass('manifolds__panel_wrong');
        manifoldsBlocked = false;
      }, 500);
      return false;
    }
    $(this).toggleClass('manifolds__button_active');
    manifoldsCounter++;
    if (manifoldsCounter > 10) {
      showCompletedTask();
    }
  });

  $('.task__refresh').on('click', function () {
    startManifolds();
  });

  function shuffle(array) {
    var currentIndex = array.length,
      temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }
});
