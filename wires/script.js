$(document).ready(function () {
  startWires();

  function showCompletedTask() {
    $('.modal').addClass('modal_show');
    $('.modal').removeClass('hidden');
    setTimeout(function () {
      $('.modal').removeClass('modal_show');
      $('.modal').addClass('hidden');
      startWires(); // Restart after completion for the standalone version
    }, 1500);
  }

  //    WIRES
  var wiresLeftOffset = $('.wires').offset().left;
  var wiresTopOffset = $('.wires').offset().top;
  var rightWires;

  $('.task__refresh').on('click', function () {
    startWires();
  });

  function startWires() {
    wiresLeftOffset = $('.wires').offset().left;
    wiresTopOffset = $('.wires').offset().top;
    var rightWiresIndexes = [1, 2, 3, 4];
    shuffle(rightWiresIndexes);
    var _rightWires = [];
    var wiresColors = ['yellow', 'red', 'purple', 'blue'];

    rightWiresIndexes.map(function (item, index) {
      var thisWire = $('.wires__pack_right .wire:nth-child(' + (index + 1) + ')');
      thisWire.removeClass('wire_yellow').removeClass('wire_red').removeClass('wire_purple').removeClass('wire_blue').addClass('wire_' + wiresColors[item - 1]);
      _rightWires.push({
        id: index + 1,
        color: wiresColors[item - 1],
        posX: thisWire.offset().left,
        posY: thisWire.offset().top,
        obj: thisWire
      });
    });
    rightWires = _rightWires;
    $('.wire').removeClass('wire_active').removeClass('wire_set').removeClass('wire_correct').data('connected', '');
    $('.wire path').attr('d', 'M0 0 L0 0 Z');
  }

  $('.wire__connector_left').on('mousedown', function (e) {
    if (e.which != 1) return false;
    var wire = $(this).closest('.wire');
    wire.find('.wire__body path').attr('d', 'M35 ' + (wire.index() * 100 + 80) + ', L' + (e.pageX - wiresLeftOffset) + ' ' + (e.pageY - wiresTopOffset));
    wire.addClass('wire_active').removeClass('wire_set').data('connected', '');

    $(document).on('mousemove.wiresmm', function (e) {
      wire.find('.wire__body path').attr('d', 'M35 ' + (wire.index() * 100 + 80) + ', L' + (e.pageX - wiresLeftOffset) + ' ' + (e.pageY - wiresTopOffset));
      var connected = false;
      rightWires.map(function (item) {
        if (Math.abs(item.posX - e.pageX) <= 30 && Math.abs(item.posY - e.pageY + 50) <= 30) {
          wire.find('.wire__body path').attr('d', 'M35 ' + (wire.index() * 100 + 80) + ', L' + (item.posX - wiresLeftOffset) + ' ' + (item.posY - wiresTopOffset + 50));
          wire.data('connected', item.color);
          connected = true;
          return false;
        }
      });
      if (!connected) {
        wire.data('connected', '');
      }
      checkWires();
    });

    $(document).on('mouseup.wiresmu', function (e) {
      if (e.which != 1) return false;
      wire.find('.wire__body path').attr('d', 'M35 ' + (wire.index() * 100 + 80) + ', L' + (e.pageX - wiresLeftOffset) + ' ' + (e.pageY - wiresTopOffset));
      $(document).off('mousemove.wiresmm').off('mouseup.wiresmu');

      var chosenWire = null;
      rightWires.map(function (item) {
        if (Math.abs(item.posX - e.pageX) <= 30 && Math.abs(item.posY - e.pageY + 50) <= 30) {
          chosenWire = item;
          wire.data('connected', chosenWire.color);
          wire.find('.wire__body path').attr('d', 'M35 ' + (wire.index() * 100 + 80) + ', L' + (chosenWire.posX - wiresLeftOffset) + ' ' + (chosenWire.posY - wiresTopOffset + 50));
          return false;
        }
      });
      wire.removeClass('wire_active');

      if (chosenWire != null) {
        wire.addClass('wire_set');
      } else {
        wire.removeClass('wire_set').find('.wire__body path').attr('d', 'M0 0 L0 0');
      }
      checkWires();
    });
  });

  function checkWires() {
    $('.wires__pack_left .wire').each(function () {
      var color = $(this).data('color');
      var connectedColor = $(this).data('connected');
      var correctRightWire = rightWires.find(rw => rw.color == color);
      
      if (color == connectedColor) {
        correctRightWire.obj.addClass('wire_correct');
      } else {
        correctRightWire.obj.removeClass('wire_correct');
      }
    });
    if ($('.wire_correct').length == 4 && $('.wire_active').length == 0) {
      showCompletedTask();
    }
  }

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
