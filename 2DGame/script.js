// JavaScript to enable Drag-and-Drop functionality
const components = document.querySelectorAll(".component");
const board = document.getElementById("simulation-board");

components.forEach((component) => {
  component.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text", component.id);
    component.classList.add("dragging");
  });

  component.addEventListener("dragend", () => {
    component.classList.remove("dragging");
  });
});

board.addEventListener("dragover", (e) => {
  e.preventDefault();
  const draggingComponent = document.querySelector(".dragging");
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  draggingComponent.style.left =
    mouseX - draggingComponent.offsetWidth / 2 + "px";
  draggingComponent.style.top =
    mouseY - draggingComponent.offsetHeight / 2 + "px";
});

board.addEventListener("drop", (e) => {
  const componentId = e.dataTransfer.getData("text");
  const draggedComponent = document.getElementById(componentId);

  if (draggedComponent) {
    const newComponent = draggedComponent.cloneNode(true);
    newComponent.removeAttribute("draggable");
    newComponent.style.position = "absolute";
    newComponent.style.left =
      e.clientX - draggedComponent.offsetWidth / 2 + "px";
    newComponent.style.top =
      e.clientY - draggedComponent.offsetHeight / 2 + "px";

    board.appendChild(newComponent);
    enableComponentMovement(newComponent);
    applySimulationFunctionality(newComponent);
  }
});

// Add event listeners for connection points
const connectionPoints = document.querySelectorAll(".connection-point");

connectionPoints.forEach((point) => {
  point.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  point.addEventListener("drop", (e) => {
    const componentId = e.dataTransfer.getData("text");
    const draggedComponent = document.getElementById(componentId);

    if (draggedComponent && draggedComponent.classList.contains("cable")) {
      const newCable = draggedComponent.cloneNode(true);
      newCable.removeAttribute("draggable");
      newCable.style.position = "absolute";
      newCable.style.left = point.style.left;
      newCable.style.top = point.style.top;

      board.appendChild(newCable);
    }
  });
});

// Function to enable moving components within the board
function enableComponentMovement(component) {
  let isDragging = false;
  let offsetX, offsetY;

  component.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - component.getBoundingClientRect().left;
    offsetY = e.clientY - component.getBoundingClientRect().top;
    component.style.zIndex = 1000; // Bring the component to the front
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      component.style.left = e.clientX - offsetX + "px";
      component.style.top = e.clientY - offsetY + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      component.style.zIndex = ""; // Reset z-index
    }
  });
}

// Function to simulate moving a hydraulic piston using a valve
function simulateValveAndPiston(valve, piston) {
  valve.addEventListener("click", () => {
    const currentPosition = parseInt(piston.style.left, 10) || 0;
    piston.style.left = currentPosition + 10 + "px"; // Move piston to the right
  });
}

// Apply simulation functionality to components
function applySimulationFunctionality(component) {
  if (component.id === "light") {
    simulateLight(component);
  } else if (component.id === "piston") {
    // Store the piston for later use
    window.pistonComponent = component;
  } else if (component.id === "relay") {
    simulateRelay(component);
  } else if (component.id === "valve") {
    // Check if the piston is already on the board
    if (window.pistonComponent) {
      simulateValveAndPiston(component, window.pistonComponent);
    }
  }
}

// Enable simulation for existing components on the board
document.querySelectorAll(".simulation-board > div").forEach((component) => {
  enableComponentMovement(component);
  applySimulationFunctionality(component);
});
