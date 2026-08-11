<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["contractID"]) && !empty($_POST["contractID"])){
      $contractID = htmlspecialchars($_POST['contractID'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("failed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $contractID);
      $sql2 = "SELECT `startDate`, `endDate`, `notes`, `support`, `account`, `cost`, `currency`, `bilingCycle`, `docslink` FROM `contracts` WHERE `id`=".$input1;
      if(!$result2 = $mysqli->query($sql2)){
        die("failed");
      }
      if ($result2->num_rows > 0){
        $row2 = $result2->fetch_array(MYSQLI_ASSOC);
        echo json_encode($row2);
      }else{
        die("failed");
      }
      $mysqli->close();
    }
  }
?>
