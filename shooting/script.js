$(document).ready(function () {
  startShooting();
  handleShootingEvents();

  function showCompletedTask() {
    $('.modal').addClass('modal_show');
    $('.modal').removeClass('hidden');
    setTimeout(function () {
      $('.modal').removeClass('modal_show');
      $('.modal').addClass('hidden');
      startShooting();
    }, 1500);
  }

  // 
  //    SHOOTING
  //
  var shootingLeftOffset = $('.shooting').offset().left;
  var shootingTopOffset = $('.shooting').offset().top;
  var asteroidCounter = 0;
  var asteroidQueueCounter = 1;
  var maxAsteroidCount = 5;
  var reduiredAsteroidNumber = 20;
  var asteroidFlyingTime = 3000;
  var asteroidStatuses = ['idle', 'idle', 'idle', 'idle', 'idle'];
  var asteroidInterval;

  function startShooting() {
    asteroidCounter = 0;
    asteroidStatuses = ['idle', 'idle', 'idle', 'idle', 'idle'];
    if (asteroidInterval != null) {
      clearInterval(asteroidInterval);
    }
    $('.shooting__counter').text('Destroyed: ' + asteroidCounter);
    shootingLeftOffset = $('.shooting').offset().left;
    shootingTopOffset = $('.shooting').offset().top;
    $('.shooting__asteroid').each(function () {
      $(this).stop();
      $(this).css('left', 600);
    });
    $('.shooting__asteroid-wreckage').css('left', 700);
    queueAsteroids();
  }

  function queueAsteroids() {
    asteroidInterval = setInterval(function () {
      if (asteroidCounter < reduiredAsteroidNumber) {
        var asteroid = $('.shooting__asteroid').eq(asteroidQueueCounter);
        if (asteroidStatuses[asteroid.index()] == 'idle') {
          asteroidStatuses[asteroid.index()] = 'flies';
          sendAsteroid(asteroid);
        }
        asteroidQueueCounter++;
        if (asteroidQueueCounter == maxAsteroidCount) asteroidQueueCounter = 0;
      }
    }, 1000);
  }

  function sendAsteroid(asteroid) {
    asteroid.stop();
    asteroid.css('left', 600).css('top', Math.floor(Math.random() * 500));
    var endAngle = Math.floor(Math.random() * 720);
    var top = Math.floor(Math.random() * 500);
    asteroid.animate({
      left: -100,
      top: top
    }, {
      step: function (now, fx) {
        $(this).css('transform', 'translate(-50%, -50%) rotate(' + endAngle * (now + 100) / 700 + 'deg)');
      },
      duration: asteroidFlyingTime
    }, function () {});
    setTimeout(function () {
      asteroidStatuses[asteroid.index()] = 'idle';
    }, asteroidFlyingTime);
  }

  $('.task__refresh').on('click', function () {
    startShooting();
  });

  function handleShootingEvents() {
    $('.shooting').on('mouseenter', function (e) {
      var cooldown = false;
      shootingLeftOffset = $('.shooting').offset().left;
      shootingTopOffset = $('.shooting').offset().top;
      $('.shooting__cursor').css('top', e.pageY - shootingTopOffset).css('left', e.pageX - shootingLeftOffset);
      $('.shooting__cursor-rails').find('path').attr('d', 'M0 500 L' + (e.pageX - shootingLeftOffset) + ' ' + (e.pageY - shootingTopOffset) + ' L500 500');

      $('.shooting').on('mousemove.smm', function (e) {
        $('.shooting__cursor').css('top', e.pageY - shootingTopOffset).css('left', e.pageX - shootingLeftOffset);
        $('.shooting__cursor-rails').find('path').attr('d', 'M0 500 L' + (e.pageX - shootingLeftOffset) + ' ' + (e.pageY - shootingTopOffset) + ' L500 500');
      });

      $('.shooting').on('click.sclick', function (e) {
        if (cooldown) return false;
        $('.shooting__explosion').css('top', e.pageY - shootingTopOffset).css('left', e.pageX - shootingLeftOffset).css('--explosion-rotation', Math.floor(Math.random() * 360) + 'deg').removeClass('hidden');
        cooldown = true;
        setTimeout(function () {
          $('.shooting__explosion').addClass('hidden');
        }, 150);
        setTimeout(function () {
          cooldown = false;
        }, 300);
      });

      $(document).on('click.shoot', '.shooting__asteroid', function () {
        var self = this;
        asteroidCounter++;
        $('.shooting__counter').text('Destroyed: ' + asteroidCounter);
        $(self).stop();
        var index = $(self).index();
        asteroidStatuses[index] = 'idle';
        setTimeout(function () {
          $('.shooting__asteroid-wreckage:nth-child(' + (maxAsteroidCount + 1 + index) + ')').css('left', $(self).css('left')).css('top', $(self).css('top')).css('transform', 'translate(-50%, -50%) rotate(' + Math.floor(Math.random() * 360) + 'deg)');
          $(self).css('left', 600);
        }, 50);
        setTimeout(function () {
          $('.shooting__asteroid-wreckage:nth-child(' + (maxAsteroidCount + 1 + index) + ')').css('left', 700);
        }, 350);
        if (asteroidCounter == reduiredAsteroidNumber) {
          showCompletedTask();
          $('.shooting__asteroid').each(function () {
            $(this).stop();
            $(this).css('left', 600);
          });
        }
      });

      $('.shooting').on('mouseleave.sml', function () {
        $('.shooting').off('mousemove.smm').off('mouseleave.sml').off('click.sclick');
        $(document).off('click.shoot');
      });
    });
  }
});
