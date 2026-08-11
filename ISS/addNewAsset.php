<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["code"]) && !empty($_POST["code"]) && isset($_POST["type"]) && !empty($_POST["type"])){
      date_default_timezone_set('Asia/Bahrain');
      $code = htmlspecialchars($_POST['code'], ENT_QUOTES);
      $type = htmlspecialchars($_POST['type'], ENT_QUOTES);
      $location = htmlspecialchars($_POST['location'], ENT_QUOTES);
      $empID = htmlspecialchars($_POST['empID'], ENT_QUOTES);
      if(empty($empID)){
        $empID = 0;
      }
      $serialNumber = htmlspecialchars($_POST['serialNumber'], ENT_QUOTES);
      $manufacturer = htmlspecialchars($_POST['manufacturer'], ENT_QUOTES);
      $model = htmlspecialchars($_POST['model'], ENT_QUOTES);
      $ip = htmlspecialchars($_POST['ip'], ENT_QUOTES);
      $deviceName = htmlspecialchars($_POST['deviceName'], ENT_QUOTES);
      $processor = htmlspecialchars($_POST['processor'], ENT_QUOTES);
      $os = htmlspecialchars($_POST['os'], ENT_QUOTES);
      $memory = htmlspecialchars($_POST['memory'], ENT_QUOTES);
      $hdd = htmlspecialchars($_POST['hdd'], ENT_QUOTES);
      $specification = htmlspecialchars($_POST['specification'], ENT_QUOTES);
      $department = htmlspecialchars($_POST['department'], ENT_QUOTES);
      $firmware = htmlspecialchars($_POST['firmware'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $code);
      $input2 = mysqli_real_escape_string($mysqli, $type);
      $input3 = mysqli_real_escape_string($mysqli, $location);
      $input4 = mysqli_real_escape_string($mysqli, $empID);
      $input5 = mysqli_real_escape_string($mysqli, $serialNumber);
      $input6 = mysqli_real_escape_string($mysqli, $manufacturer);
      $input7 = mysqli_real_escape_string($mysqli, $model);
      $input8 = mysqli_real_escape_string($mysqli, $ip);
      $input9 = mysqli_real_escape_string($mysqli, $deviceName);
      $input10 = mysqli_real_escape_string($mysqli, $processor);
      $input11 = mysqli_real_escape_string($mysqli, $os);
      $input12 = mysqli_real_escape_string($mysqli, $memory);
      $input13 = mysqli_real_escape_string($mysqli, $hdd);
      $input14 = mysqli_real_escape_string($mysqli, $specification);
      $input15 = mysqli_real_escape_string($mysqli, $user);
      $input16 = mysqli_real_escape_string($mysqli, $department);
      $input17 = mysqli_real_escape_string($mysqli, $firmware);

      $sql0 = "SELECT * FROM `assets` WHERE `serialNumber`='".$input5."'";
      if(!$result0 = $mysqli->query($sql0)){
        die("queryFailed");
      }
      if ($result0->num_rows > 0){
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed, Already Added Serial Number</h2><center></center>";
        die();
      }

      $sql00 = "SELECT * FROM `assets` WHERE `code`='".$input1."'";
      if(!$result00 = $mysqli->query($sql00)){
        die("queryFailed");
      }
      if ($result00->num_rows > 0){
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed, Already Added Code</h2><center></center>";
        die();
      }

      $sql = "INSERT INTO `assets`
              (`code`, `serialNumber`, `deviceName`, `type`, `location`, `manufacturer`, `model`, `processor`, `os`, `memory`, `hdd`
                , `ip`, `empID`, `specification`, `inActive`, `department`, `firmwareVer`)
              VALUES
              ('".$input1."','".$input5."','".$input9."','".$input2."','".$input3."','".$input6."','".$input7."','".$input10."','".$input11."','".$input12."','".$input13."'
                ,'".$input8."','".$input4."','".$input14."',0,'".$input16."','".$input17."')";
      if($mysqli->query($sql) === TRUE){
        $assetID = $mysqli->insert_id;
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`)
                   VALUES (".$input15.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'add','assets',".$mysqli->insert_id.")";
        $mysqli->query($sqlLog);
        if(!empty($_FILES['imagesFiles']['name'])){
          if ($_FILES['imagesFiles']['error'] !== 0){
            include "header.php";
            echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
            echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed, Upload Fail</h2><center></center>";
            die();
          }
          $info = getimagesize($_FILES['imagesFiles']['tmp_name']);
          if ($info === FALSE){
            include "header.php";
            echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
            echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed, Upload Fail</h2><center></center>";
            die();
          }
          if (($info[2] !== IMAGETYPE_GIF) && ($info[2] !== IMAGETYPE_JPEG) && ($info[2] !== IMAGETYPE_PNG) && ($info[2] !== IMAGETYPE_BMP)) {
            include "header.php";
            echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
            echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed, Wrong Image Type</h2><center></center>";
            die();
          }

          if (!move_uploaded_file($_FILES["imagesFiles"]["tmp_name"], "/var/www/html/ISS/itemsImages/asset".$assetID."_".$_FILES["imagesFiles"]["name"])){
            include "header.php";
            echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
            echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed, Upload Fail</h2><center></center>";
            die();
          }else{
            $imagePath = "/var/www/html/ISS/itemsImages/asset".$assetID."_".$_FILES["imagesFiles"]["name"];
            if($info[0] > 1000){
              $imageLayer = imagecreatetruecolor(1000, (1000*$info[1])/$info[0]);
              imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, 1000, (1000*$info[1])/$info[0], $info[0], $info[1]);
              imagejpeg($imageLayer, $imagePath);
            }elseif($info[1] > 1000){
              $imageLayer = imagecreatetruecolor((1000*$info[0])/$info[1], 1000);
              imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, (1000*$info[0])/$info[1],1000 , $info[0], $info[1]);
              imagejpeg($imageLayer, $imagePath);
            }
            $sqlIMG = "UPDATE `assets` SET `image`='asset".$assetID."_".$_FILES["imagesFiles"]["name"]."' WHERE `id`=".$assetID;
            if($mysqli->query($sqlIMG) === FALSE){
              include "header.php";
              echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
              echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed, Update Record Fail</h2><center></center>";
              die();
            }
          }
        }

        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Added Successfully</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=assets.php" />');
      }else{
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=newAssets.php" />');
      }
      $mysqli->close();
    }
  }
?>
