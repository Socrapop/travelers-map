import { initTravelersMap } from "./init-travelers-map";

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementsByClassName('travelersmap-container')) {
    initTravelersMap();
  }
});
