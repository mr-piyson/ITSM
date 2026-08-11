<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["vendorID"]) && !empty($_POST["vendorID"])){
      $vendorID = htmlspecialchars($_POST['vendorID'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $vendorID);
      $sql2 = "SELECT * FROM `vendorsContacts` WHERE `vendorID`=".$input1;
      if(!$result2 = $mysqli->query($sql2)){
        echo $sql2;
        die("queryFailed");
      }
      if ($result2->num_rows>0){
        $contacts = array();
        while($row2 = $result2->fetch_assoc()){
          $contacts[] = $row2;
        }
        echo json_encode($contacts);
      }else{
        echo "none";
      }
      $mysqli->close();
    }
  }
?>
