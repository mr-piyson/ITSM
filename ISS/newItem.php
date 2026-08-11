<?php
  include "header.php";
  if(isset($_SESSION['ISStoken']) && !empty($_SESSION['ISStoken'])){
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $token = $_SESSION['ISStoken'];
    $input1 = mysqli_real_escape_string($mysqli, $token);
    $sql = "SELECT * FROM `users` WHERE `token` = '".$input1."'";
    if(!$result = $mysqli->query($sql)){
      $mysqli->close();
      die("queryFailed");
    }
    if ($result->num_rows === 0){
      unset($_SESSION['ISStoken']);
      die("<meta http-equiv='refresh' content='0;url=index.php' />");
    }else{
      $row = $result->fetch_array(MYSQLI_ASSOC);
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      ?>
      <div class="w3-container">
        <div class="w3-margin-top w3-padding">
          <h1 class="w3-padding title">Add New Item</h1>
          <form class="w3-padding" action="addNewItem.php" method="post" enctype="multipart/form-data">
            <p>
              <label>Name</label>
              <input class="w3-input w3-border" type="text" name="name" maxlength="100" required>
            </p>
            <p>
              <label>Brand</label>
              <input class="w3-input w3-border" type="text" name="brand" maxlength="100">
            </p>
            <p>
              <label>Stock</label>
              <input class="w3-input w3-border" type="number" name="stock" value="0">
            </p>
            <p>
              <label>Category</label>
              <select class="w3-select w3-border w3-padding w3-white" name="category">
                <option value="IT Stationery and Accessories">IT Stationery and Accessories</option>
                <option value="Hardware">Hardware</option>
                <option value="Toners/Rolls">Toners/Rolls</option>
              </select>
            </p>
            <p>
              <label>Image</label>
              <input name="file" class="w3-input w3-border" type="file" accept="image/*">
            </p>
            <input type="hidden" name="user" value="<?php echo $row['id']; ?>">
            <input type="hidden" name="fromPage">
            <input class="w3-btn" style="background:#128cae;color:#fff;" type="submit" value="Add Item">
          </form>
        </div>
      </div>
      <?php
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>
