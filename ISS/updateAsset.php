<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["assetID"]) && !empty($_POST["assetID"])){
      date_default_timezone_set('Asia/Bahrain');
      $type = htmlspecialchars($_POST['type'], ENT_QUOTES);
      $location = htmlspecialchars($_POST['location'], ENT_QUOTES);
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
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $assetID = htmlspecialchars($_POST['assetID'], ENT_QUOTES);
      $department = htmlspecialchars($_POST['department'], ENT_QUOTES);
      $firmware = htmlspecialchars($_POST['firmware'], ENT_QUOTES);
      $macAddress = htmlspecialchars($_POST['macAddress'], ENT_QUOTES);
      $deviceStatus = htmlspecialchars($_POST['deviceStatus'], ENT_QUOTES);
      $purchaseDate = htmlspecialchars($_POST['purchaseDate'], ENT_QUOTES);
      if(empty($purchaseDate)){
        $purchaseDate = "0000-00-00";
      }
      $purchasePrice = htmlspecialchars($_POST['purchasePrice'], ENT_QUOTES);
      $warrantyDate = htmlspecialchars($_POST['warrantyDate'], ENT_QUOTES);
      if(empty($warrantyDate)){
        $warrantyDate = "0000-00-00";
      }
      $warrantyStatus = htmlspecialchars($_POST['warrantyStatus'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $location);
      $input3 = mysqli_real_escape_string($mysqli, $ip);
      $input4 = mysqli_real_escape_string($mysqli, $user);
      $input5 = mysqli_real_escape_string($mysqli, $assetID);
      $input6 = mysqli_real_escape_string($mysqli, $deviceName);
      $input7 = mysqli_real_escape_string($mysqli, $serialNumber);
      $input8 = mysqli_real_escape_string($mysqli, $type);
      $input9 = mysqli_real_escape_string($mysqli, $manufacturer);
      $input10 = mysqli_real_escape_string($mysqli, $model);
      $input11 = mysqli_real_escape_string($mysqli, $processor);
      $input12 = mysqli_real_escape_string($mysqli, $os);
      $input13 = mysqli_real_escape_string($mysqli, $memory);
      $input14 = mysqli_real_escape_string($mysqli, $hdd);
      $input15 = mysqli_real_escape_string($mysqli, $specification);
      $input16 = mysqli_real_escape_string($mysqli, $department);
      $input17 = mysqli_real_escape_string($mysqli, $firmware);
      $input18 = mysqli_real_escape_string($mysqli, $macAddress);
      $input19 = mysqli_real_escape_string($mysqli, $deviceStatus);
      $input20 = mysqli_real_escape_string($mysqli, $purchaseDate);
      $input21 = mysqli_real_escape_string($mysqli, $purchasePrice);
      $input22 = mysqli_real_escape_string($mysqli, $warrantyDate);
      $input23 = mysqli_real_escape_string($mysqli, $warrantyStatus);

      $sql = "UPDATE `assets` SET `location`='".$input1."',`ip`='".$input3."',`serialNumber`='".$input7."',`deviceName`='".$input6."',
       `type`='".$input8."',`manufacturer`='".$input9."',`model`='".$input10."',`processor`='".$input11."',`os`='".$input12."',`memory`='".$input13."',
       `hdd`='".$input14."',`specification`='".$input15."',`department`='".$input16."',`firmwareVer`='".$input17."',`macAddress`='".$input18."',
        `deviceStatus`='".$input19."',`purchaseDate`='".$input20."',`purchasePrice`='".$input21."',`warrantyDate`='".$input22."',`warrantyStatus`='".$input23."'
        WHERE `id`=".$input5;
      if(count($_FILES) > 0){
        if ($_FILES['file']['error'] !== 0){
          die("failedUpload1");
        }
        $info = getimagesize($_FILES['file']['tmp_name']);
        if ($info === FALSE){
          die("failedUpload2");
        }
        if (($info[2] !== IMAGETYPE_GIF) && ($info[2] !== IMAGETYPE_JPEG) && ($info[2] !== IMAGETYPE_PNG) && ($info[2] !== IMAGETYPE_BMP)) {
          die("failedUpload3");
        }

        if (!move_uploaded_file($_FILES["file"]["tmp_name"], "/var/www/html/ISS/itemsImages/asset".$assetID."_".$_FILES["file"]["name"])){
          die("failedUpload4");
        }else{
          $imagePath = "/var/www/html/ISS/itemsImages/asset".$assetID."_".$_FILES["file"]["name"];
          if($info[0] > 1000){
            $imageLayer = imagecreatetruecolor(1000, (1000*$info[1])/$info[0]);
            imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, 1000, (1000*$info[1])/$info[0], $info[0], $info[1]);
            imagejpeg($imageLayer, $imagePath);
          }elseif($info[1] > 1000){
            $imageLayer = imagecreatetruecolor((1000*$info[0])/$info[1], 1000);
            imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, (1000*$info[0])/$info[1],1000 , $info[0], $info[1]);
            imagejpeg($imageLayer, $imagePath);
          }
          $sql = "UPDATE `assets` SET `location`='".$input1."',`ip`='".$input3."',`serialNumber`='".$input7."',`deviceName`='".$input6."',
           `type`='".$input8."',`manufacturer`='".$input9."',`model`='".$input10."',`processor`='".$input11."',`os`='".$input12."',`memory`='".$input13."',
           `hdd`='".$input14."',`specification`='".$input15."',`department`='".$input16."',`firmwareVer`='".$input17."',`macAddress`='".$input18."',
            `deviceStatus`='".$input19."',`purchaseDate`='".$input20."',`purchasePrice`='".$input21."',`warrantyDate`='".$input22."',`warrantyStatus`='".$input23."',
            `image`='asset".$assetID."_".$_FILES["file"]["name"]."' WHERE `id`=".$input5;
        }
      }
      if($mysqli->query($sql) === TRUE){
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input4.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'update','asset',".$input5.")";
        $mysqli->query($sqlLog);
        if($_POST['assetVerified'] == "yes"){
          $sql2 = "UPDATE `assets` SET `verified`='".date('Y-m-d H:i:s')."' WHERE `id`=".$input5;
          $mysqli->query($sql2);
        }
        die("added");
      }else{
        echo $sql;
        die("failed");
      }
      $mysqli->close();
    }
  }
?>
