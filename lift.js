function Elevator() {
  let Compartment = class Compartment {
    constructor() {
      let me = this;
      this.floors = 20;
      this.compartment = [];
      this.count = 3;
      let buttons = (function () {
        let upDownButtons = [];
        for (let floor = 20; floor >= 1; floor += -1) {
          upDownButtons.push(
            `<div id = 'floor-buttons-${floor}' class='floor-buttons '><div class="floor-number-container "><label class="floor-number-label">${floor}</label></div><button class='button upSide' data-floor='${floor}'><div class='upSide'></div></button><button class='button downSide' data-floor='${floor}'><div class='downSide'></div></button></div>`
          );
        }
        return upDownButtons;
      })().join("");
      $("#upDownButtons")
        .empty()
        .append($(buttons))
        .off("click")
        .on("click", "button", function () {
          if ($(this).hasClass("on")) {
            return;
          }
          $(this).toggleClass("on");
          return $(me).trigger("pressed", [
            {
              floor: parseInt($(this)[0].dataset.floor),
              dir: $(this).children().hasClass("upSide")
                ? "upSide"
                : "downSide",
            },
          ]);
        });
    }

    CompartmentMove(compartment, floor) {
      let mCompartment = this.compartment;
      let deferr = $.Deferred();

      if (this.compartment[compartment - 1].moving) {
        return deferr.reject();
      }

      this.compartment[compartment - 1].moving = true;
      $(`#lift${compartment} .compartment`).animate(
        {
          bottom: `${(floor - 1) * 35}px`,
        },
        {
          complete: function () {
            mCompartment[compartment - 1].floor = floor;
            mCompartment[compartment - 1].moving = false;
            return deferr.resolve();
          },
        }
      );
      $(`#lift${compartment} .compartment > div`).animate({
        top: `${-425 + floor * 35}px`,
      });
      return deferr;
    }

    closestCompartment(floor) {
      let compartment, i, a;
      let nonmoving = function () {
        let j, len, result;
        let r = this.compartment;
        result = [];
        for (i = j = 0, len = r.length; j < len; i = ++j) {
          compartment = r[i];
          if (!compartment.moving && !compartment.inMaintenance) {
            result.push([i + 1, Math.abs(floor - compartment.floor)]);
          }
        }
        return result;
      }.call(this);
      let closest = nonmoving.reduce(function (a, b) {
        if (a[1] <= b[1]) {
          return a;
        } else {
          return b;
        }
      });
      let low = (function () {
        let len;
        let result = [];
        for (let j = 0, len = nonmoving.length; j < len; j++) {
          a = nonmoving[j];
          if (a[1] === closest[1]) {
            result.push(a[0]);
          }
        }
        return result;
      })();
      return low[Math.floor(Math.random() * low.length)];
    }
    ButtonClear(floor, dir) {
      return $(`#floor-buttons-${floor} > button > div.${dir}`)
        .parent()
        .removeClass("on");
    }
  };

  let elevator = new Compartment();

  for (let i = 0; i < elevator.count; i++) {
    elevator.compartment.push({
      floor: 0,
    });
    let count = i;
    dynamicCompart = `<div id = "lift${
      count + 1
    }" class="elevator col "><div class="compartment"><div "></div></div></div >`;

    $("#elevators").prepend(dynamicCompart);
  }

  $(elevator).on("pressed", function (e, { floor, dir }) {
    alert("Elevator arrives floor - " + floor);
    return elevator
      .CompartmentMove(elevator.closestCompartment(floor), floor)
      .then(function () {
        return elevator.ButtonClear(floor, dir);
      });
  });
}
Elevator();
