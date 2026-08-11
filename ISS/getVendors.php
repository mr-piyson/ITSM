<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $sql = "SELECT * FROM `vendors`";
    if(!$result = $mysqli->query($sql)){
      die("queryFailed");
    }
    $vendors = array();
    while($row = $result->fetch_assoc()){
      $vendors[]=array('name' => $row["name"], 'id' => $row["id"], 'notes' => str_replace(array("\r", "\n"), '', $row["notes"]));
    }
    echo json_encode($vendors);
  }
?>
