<?php
  include "header.php";
  if(isset($_SESSION['ISStoken']) && !empty($_SESSION['ISStoken'])){
    echo '<meta http-equiv="refresh" content="0;url=home.php" />';
    die();
  }
?>

    <div id="loginDiv" class="w3-card w3-animate-left" style="margin:100px auto;">
      <div class="w3-container" style="background:#0b5266;color:#fff;">
        <h3 style="user-select:none;">ITSM</h3>
      </div>
      <form class="w3-container" action="home.php" method="post">
        <p>
          <label style="user-select:none;" class="w3-text-grey w3-small">Username</label>
          <input class="w3-input" type="text" name="username" style="outline:none;" required>
        </p>
        <p>
          <label style="user-select:none;" class="w3-text-grey w3-small">Password</label>
          <input class="w3-input" type="password" name="password" style="outline:none;" required>
        </p>
        <p>
          <button class="w3-btn w3-small" style="background:#0b5266;color:#fff;">LOG IN  ❯</button>
        </p>
      </form>
    </div>

<?php include "footer.php"; ?>
