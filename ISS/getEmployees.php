<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $sql = "SELECT * FROM `employees` WHERE `inActive`=0";
    if(!$result = $mysqli->query($sql)){
      die("queryFailed");
    }
    $emplyees = array();
    while($row = $result->fetch_assoc()){
      $emplyees[]=array('name' => $row["name"], 'empID' => $row["empID"]);
    }
    echo json_encode($emplyees);
  }
?>
