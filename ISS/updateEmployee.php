<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["empID"]) && !empty($_POST["empID"]) && isset($_POST["name"]) && !empty($_POST["name"])){
      date_default_timezone_set('Asia/Bahrain');
      $empID = htmlspecialchars($_POST['empID'], ENT_QUOTES);
      $name = htmlspecialchars($_POST['name'], ENT_QUOTES);
      $email = htmlspecialchars($_POST['email'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $name);
      $input2 = mysqli_real_escape_string($mysqli, $user);
      $input3 = mysqli_real_escape_string($mysqli, $empID);
      $input4 = mysqli_real_escape_string($mysqli, $email);

      $sql = "UPDATE `employees` SET `name`='".$input1."',`email`='".$input4."' WHERE `empID`=".$input3;
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

        if (!move_uploaded_file($_FILES["file"]["tmp_name"], "/var/www/html/ISS/itemsImages/emp".$empID."_".$_FILES["file"]["name"])){
          die("failedUpload4");
        }else{
          $imagePath = "/var/www/html/ISS/itemsImages/emp".$empID."_".$_FILES["file"]["name"];
          if($info[0] > 1000){
            $imageLayer = imagecreatetruecolor(1000, (1000*$info[1])/$info[0]);
            imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, 1000, (1000*$info[1])/$info[0], $info[0], $info[1]);
            imagejpeg($imageLayer, $imagePath);
          }elseif($info[1] > 1000){
            $imageLayer = imagecreatetruecolor((1000*$info[0])/$info[1], 1000);
            imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, (1000*$info[0])/$info[1],1000 , $info[0], $info[1]);
            imagejpeg($imageLayer, $imagePath);
          }
          $sql = "UPDATE `employees` SET `name`='".$input1."',`email`='".$input4."',`image`='emp".$empID."_".$_FILES["file"]["name"]."' WHERE `empID`=".$input3;
        }
      }
      if($mysqli->query($sql) === TRUE){
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input2.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'update','empID',".$input3.")";
        $mysqli->query($sqlLog);
        die("added");
      }else{
        die("failed");
      }
      $mysqli->close();
    }
  }
?>
