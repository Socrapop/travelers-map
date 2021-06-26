import { initTravelersMap } from "./init-travelers-map.js";

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementsByClassName('travelersmap-container')) {
    initTravelersMap();
  }
});
