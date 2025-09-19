function updateDateTime() {
  const now = new Date();


  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  document.getElementById("date").textContent = `${day}.${month}.${year}`;


  // 24 hours format
  const timeOptions = { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false   // forces 24-hour format
  };
  document.getElementById("time").textContent =
    now.toLocaleTimeString(undefined, timeOptions);
}

// Update every second
setInterval(updateDateTime, 1000);
updateDateTime();
