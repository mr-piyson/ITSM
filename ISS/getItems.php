<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $sql = "SELECT * FROM `items`";
    if(!$result = $mysqli->query($sql)){
      die("queryFailed");
    }
    $items = array();
    while($row = $result->fetch_assoc()){
      $items[]=array('name' => $row["name"], 'brand' => $row["brand"], 'id' => $row["id"], 'stock' => $row["stock"]);
    }
    echo json_encode($items);
  }
?>
