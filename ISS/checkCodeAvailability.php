<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["code"]) && !empty($_POST["code"])){
      $code = htmlspecialchars($_POST['code'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $code);
      $sql = "SELECT * FROM `assets` WHERE `code`='".$input1."'";
      if(!$result = $mysqli->query($sql)){
        die("queryFailed");
      }
      if ($result->num_rows > 0){
        $mysqli->close();
        die("alreadyAdded");
      }else{
        $mysqli->close();
        die("available");
      }
    }
  }
?>
