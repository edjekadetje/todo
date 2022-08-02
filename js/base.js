let _settings = {};

_settings['screenWidth'] = 1024;

_settings['boxesPerRow'] = 4;
_settings['frontColor'] = '#000000';
_settings['backColor'] = '#ffffff';
_settings['boxWidth'] = 300;
_settings['sameHeight'] = 1;
_settings['showBoxesWithSubs'] = false;
_settings['showSubBoxes'] = [];

_settings['colors'] = {};
_settings['colors']['white'] = 'white';
_settings['colors']['yellow'] = 'yellow';
_settings['colors']['blue'] = '#95CCFB';
_settings['colors']['green'] = '#8FE08F';
_settings['colors']['pink'] = 'pink';
_settings['colors']['purple'] = '#E36BE3';
_settings['colors']['gray'] = 'gray';

let _boxes = [];
let lastHeight = 0;

let cursor_x = -1;
let cursor_y = -1;

$(function () {
    load_settings();
    load_boxes();

    $('#settings').on('click tap', function () {
        start_settings_page();
    });

    $('#addBoxPlus').on('click tap', function () {
        start_add_think_box('');
    });
    $('#closeAddThinkBox').on('click tap', function () {
        $('#mainBox').css('display', 'none');
    });


    $('.hideBox').on('click tap', function () {
        $('#subMenu').css('display', 'none');
    });

    $('#showAllBoxes').on('click tap', function () {
        handle_show_all_boxes_state();
    });
});

function handle_show_all_boxes_state() {
    _settings['showBoxesWithSubs'] = !_settings['showBoxesWithSubs'];
    save_settings_to_local_storage();
    load_boxes();
}

function start_add_think_box(id) {
    if ($('#mainBox').css('display') == 'block') {
        $('#mainBox').css('display', 'none');
        return;
    } else {
        $('#mainBox').css('display', 'block');
        let left = window.innerWidth / 2 - 150;
        $('#mainBox').css('left', left + 'px');


    }
    $('#addThinkBox').off();
    $('#addThinkBox').on('click tap', function () {
        add_think_box(id);
    });


}

function add_think_box(id) {
    $('#mainBox').css('display', 'block');
    if ($('#mainInputTitle').val() == '') {
        alert('No title entered');
        $('#mainInputTitle').focus();
        return;
    }
    let newBox = {};
    newBox['id'] = 0;
    newBox['mother'] = 0;
    newBox['title'] = '';
    newBox['text'] = '';
    newBox['color'] = 'white';
    newBox['hasChild'] = false;


    newBox['id'] = _boxes.length;
    if (id === '') {
        newBox['mother'] = newBox['id'];
    } else {
        newBox['mother'] = id;
        newBox['color'] = get_mother_color(id);
    }
    newBox['title'] = $('#mainInputTitle').val();
    newBox['text'] = $('#mainInputText').val();

    _boxes[_boxes.length] = newBox;
    save_boxes();
    $('#mainBox').css('display', 'none');
    load_boxes();

}

function get_mother_color(id) {
    let returnColor = 'white';
    $.each(_boxes, function (key) {
        if (_boxes[key]['id'] == id) {
            returnColor = _boxes[key]['color'];
        }
    });

    return returnColor;
}

function append_box_to_screen(boxData) {
    //check the box width
    let findIndex = false;
    let boxTemplate = '<div class="mainBoxSubContainer" id="subContainer_#id#">' +
        '                <div class="mainBoxSub" style="width: #width#px; background-color: #backColor#">' +
        '                  <div class="mainBoxTitle">' +
        '                     <input type="text" id="mainInputTitle" placeholder="title" class="mainBoxTitleInputSub" data-id="#id#" value="#title#">' +
        '                     <div class="mainBoxMenuSub pointer" id="mainBoxMenuSub_#id#" data-id="#id#" data-title="#title#" data-color="#backColorName#">...&nbsp;</div>' +
        '                  </div>' +
        '                  <div class="mainBoxInput">' +
        '                     <textarea rows="4" id="mainInputText#id#" placeholder="text" class="mainBoxTextInput mainBoxTextInputSub" data-id="#id#" >#text#</textarea>' +
        '                  </div>' +
        '                </div>' +
        '              </div>';

    boxTemplate = boxTemplate.replace(/#id#/g, boxData['id']);
    boxTemplate = boxTemplate.replace(/#title#/g, boxData['title']);
    boxTemplate = boxTemplate.replace(/#text#/, boxData['text']);
    boxTemplate = boxTemplate.replace(/#backColor#/g, _settings['colors'][boxData['color']]);
    boxTemplate = boxTemplate.replace(/#backColorName#/g, boxData['color']);
    boxTemplate = boxTemplate.replace(/#width#/, _settings['boxWidth']);
    $('#mainInputTitle').val('');
    $('#mainInputText').val('');


    if (_settings['showBoxesWithSubs']) {
        if ($('#subContainer_' + boxData['mother']).length) {
            $('#subContainer_' + boxData['mother']).append(boxTemplate);
            $('#subContainer_' + boxData['mother']).css('width', (_settings['boxWidth'] + 18) + 'px');
            $('#subContainer_' + boxData['mother']).css('float', 'left');
            $('#subContainer_' + boxData['mother']).css('border', '0px solid blue');
        } else {
            $('#contentNext').append(boxTemplate);
        }


    } else {
        if (boxData['mother'] == boxData['id']) {
            $('#contentNext').append(boxTemplate);
        } else {
            findIndex = _settings['showSubBoxes'].indexOf(boxData['mother']);
            if (findIndex != -1) {
                $('#subContainer_' + boxData['mother']).append(boxTemplate);
                $('#subContainer_' + boxData['mother']).css('width', (_settings['boxWidth'] + 18) + 'px');
                $('#subContainer_' + boxData['mother']).css('float', 'left');
                $('#subContainer_' + boxData['mother']).css('border', '0px solid blue');
            }
        }
    }


    if (boxData['hasChild'] != undefined && boxData['hasChild']) {
        $('#mainBoxMenuSub_' + boxData['id']).css('text-decoration', 'underline');
    }

    $('.mainBoxMenuSub').off();
    $('.mainBoxMenuSub').on('click tap', function () {
        start_sub_menu($(this).data());
    });

    $('.mainBoxTextInputSub').off();
    $('.mainBoxTextInputSub').on('change', function () {
        update_box_content('text', $(this).val(), $(this).data());
    })

    $('.mainBoxTitleInputSub').off();
    $('.mainBoxTitleInputSub').on('change', function () {
        update_box_content('title', $(this).val(), $(this).data());
    })
    implement_settings();

}

function update_box_content(what, content, data) {
    $.each(_boxes, function (key) {
        if (_boxes[key]['id'] == data['id']) {
            if (what == 'text') {
                _boxes[key]['text'] = content
            }
            if (what == 'title') {
                _boxes[key]['title'] = content
            }
        }
    });
    save_boxes();
}

function start_sub_menu(data) {
    let id = data['id'];
    let setColor = data['color']

    // define pos of sub menu
    let position = $('#mainBoxMenuSub_' + id).position();
    let leftPos = position.left;
    let topPos = position.top - $(document).scrollTop();

    if ((position.left + 195) > window.innerWidth) {
        leftPos = position.left - 170;
    }

    $('.colorBox').html('')
    $('.' + setColor).html('x');
    $('.subMenuItem').each(function () {
        $(this).data('id', id);
    });

    $('.subMenuItem').each(function () {
        $(this).data('title', data['title']);
    });

    $('.colorBox').each(function () {
        $(this).data('id', id);
    });
    $('#subMenu').css('display', 'block');
    $('#subMenu').css('top', topPos + 'px');
    $('#subMenu').css('left', leftPos + 'px');

    // set sub box links
    if (check_has_child(id)) {
        $('#showSubBoxes').css('color', 'black');
        $('#showSubBoxes').hover(function () {
            $('#showSubBoxes').css('color', 'blue');

        })
    } else {
        $('#showSubBoxes').css('color', 'silver');
        $('#showSubBoxes').hover(function () {
            $('#showSubBoxes').css('color', 'silver');

        })

    }

    $('.addSubBox').off();
    $('.addSubBox').on('click tap', function () {
        $('#subMenu').css('display', 'none');
        start_add_think_box($(this).data('id'));

    });

    $('.colorBox').off();
    $('.colorBox').on('click tap', function () {
        set_color_for_boxes($(this).data());
    });

    $('#showSubBoxes').off();
    $('#showSubBoxes').on('click tap', function () {
        set_show_sub_boxes($(this).data());
    });

    $('.deleteBoxFirst').off();
    $('.deleteBoxFirst').on('click tap', function () {
        delete_box_first($(this).data());
    });

    $('.deleteBoxAll').off();
    $('.deleteBoxAll').on('click tap', function () {
        delete_box_all($(this).data());
    });
}

function delete_box_first(data){
   let doDelete =  confirm('Delete box '+data['title']+' and leave the sub boxes?');
   if(doDelete === true){
       $('#subMenu').css('display', 'none');
       let i = _boxes.length;
       while (i--) {
           if (_boxes[i]['id'] == data['id']) {
               _boxes.splice(i, 1);
           }
       }

       $.each(_boxes, function (key) {
           if (_boxes[key]['mother'] == data['id']) {
               _boxes[key]['mother'] = _boxes[key]['id'];
           }
       });
       save_boxes();
       load_boxes();
   }
}

function delete_box_all(data){
    let doDelete =  confirm('Delete box '+data['title']+' and all sub boxes?');
    if(doDelete === true){
        $('#subMenu').css('display', 'none');
        let i = _boxes.length;
        while (i--) {
            if (_boxes[i]['mother'] == data['id']) {
                _boxes.splice(i, 1);
            }
        }
        save_boxes();
        load_boxes();
    }
}


function set_show_sub_boxes(data) {
    $('#subMenu').css('display', 'none');

    let boxFound = false;
    $.each(_settings['showSubBoxes'], function (key) {
        if (_settings['showSubBoxes'][key] == data['id']) {
            _settings['showSubBoxes'].splice(key, 1);
            boxFound = true;
        }
    });

    if (!boxFound) {
        _settings['showSubBoxes'][_settings['showSubBoxes'].length] = data['id'];
    }
    save_settings_to_local_storage();
    load_boxes();
}


function set_color_for_boxes(data) {
    $('#subMenu').css('display', 'none');
    $.each(_boxes, function (key) {
        if (_boxes[key]['mother'] == data['id']) {
            _boxes[key]['color'] = data['color'];
        }
    });
    save_boxes();
    load_boxes();
}

function check_has_child(id) {
    let hasChild = false;
    $.each(_boxes, function (key) {
        if (_boxes[key]['id'] == id && _boxes[key]['hasChild'] != undefined) {
            hasChild = _boxes[key]['hasChild'];
        }
    });

    return hasChild;

}

function save_boxes() {
    localStorage.setItem('_boxes', JSON.stringify(_boxes));

}

function calc_expected_box_width() {
    let screenWidth = window.innerWidth;
    let deductSpace = 28;
    if (_settings['boxesPerRow'] > 3) {
        deductSpace = 24;
    }
    if (_settings['boxesPerRow'] > 8) {
        deductSpace = 22;
    }
    // deduct the 4 padding px
    let boxWidth = screenWidth - (_settings['boxesPerRow'] * deductSpace);
    return Math.floor(boxWidth / _settings['boxesPerRow']);
}

function load_boxes() {
    $('#contentNext').html('');
    if (localStorage.getItem('_boxes') != null) {

        _boxes = jQuery.parseJSON(localStorage.getItem('_boxes'));
        $.each(_boxes, function (key) {
            if (_boxes[key]['id'] != _boxes[key]['mother']) {
                set_box_has_child(_boxes[key]['mother']);
            }
        });

        $.each(_boxes, function (key) {
            append_box_to_screen(_boxes[key]);
        });
        implement_settings();
    }
}


function set_box_has_child(id) {
    $.each(_boxes, function (key) {
        if (_boxes[key]['id'] == id) {
            _boxes[key]['hasChild'] = true;
        }
    });

}

function start_settings_page() {
    if ($('#settingsPage').css('display') == 'block') {
        $('#settingsPage').css('display', 'none');
        return;
    }
    $('#settingsPage').css('display', 'block');
    let left = (window.innerWidth / 2) - ($('#settingsPage').width() / 2)
    $('#settingsPage').css('left', left + 'px');

    //load the values
    $.each(_settings, function (key) {
        $('#' + key).val(_settings[key]);
    });
    $('.sameHeight').prop('checked', '');
    $('#sameHeight'+_settings['sameHeight']).prop('checked', 'checked');


    $('#saveSettings').on('click tap', function () {
        save_settings();
    });
}

function save_settings() {
    $('#settingsPage').css('display', 'none');
    $('.inputLine input').each(function () {
        _settings[$(this).prop('id')] = $(this).val();
    });
    _settings['sameHeight'] = $('input[type="radio"][name="sameHeight"]:checked').val();
    save_settings_to_local_storage();
    implement_settings()
    load_boxes();
}

function load_settings() {
    if (localStorage.getItem('_settings') === null) {
        localStorage.setItem('_settings', JSON.stringify(_settings));
    } else {
        _settings = jQuery.parseJSON(localStorage.getItem('_settings'));
    }
}

function save_settings_to_local_storage() {
    localStorage.setItem('_settings', JSON.stringify(_settings));
}

function implement_settings() {
    $('body').css('background-color', _settings['backColor']);
    $('body').css('color', _settings['frontColor']);
    _settings['boxWidth'] = calc_expected_box_width();
    $('.mainBoxSub').each(function () {
        $(this).css('width', _settings['boxWidth'] + 'px');
    });

    $('#sameHeight' + _settings['sameHeight']).prop('checked', true);

    lastHeight = 0;
    if (_settings['sameHeight'] == 1) {
        lastHeight = get_max_box_heights();
    }
    set_box_heights();

}

function get_max_box_heights() {

    let useHeight = 0;
    $('.mainBoxTextInput').each(function () {
        if (useHeight < $(this).prop('scrollHeight')) {
            useHeight = $(this).prop('scrollHeight');
        }
    });
    return useHeight;
}

function set_box_heights() {
    let newHeight = 0;
    $('.mainBoxTextInput').each(function () {
        if (_settings['sameHeight'] == 3) {
            $(this).css('height', '20px');
            newHeight = $(this).prop('scrollHeight') + 12;
            $(this).css('height', newHeight + 'px');
        } else if (_settings['sameHeight'] == 2) {
            $(this).css('height', '150px');
        } else {
            $(this).height(lastHeight + 'px');

        }
    });
}

