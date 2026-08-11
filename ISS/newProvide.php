<?php
include "header.php";
if (isset($_SESSION['ISStoken']) && !empty($_SESSION['ISStoken'])) {
  $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
  if ($mysqli->connect_errno) {
    die("connectionFailed");
  }
  $token = $_SESSION['ISStoken'];
  $input1 = mysqli_real_escape_string($mysqli, $token);
  $sql = "SELECT * FROM `users` WHERE `token` = '" . $input1 . "'";
  if (!$result = $mysqli->query($sql)) {
    $mysqli->close();
    die("queryFailed");
  }
  if ($result->num_rows === 0) {
    unset($_SESSION['ISStoken']);
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  } else {
    $row = $result->fetch_array(MYSQLI_ASSOC);
    echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
?>

    <script>
      var itemsNames = [];
      var itemsStock = [];
      var itemsBrands = [];
      var itemsIDs = [];
      var empNames = [];
      var empIDs = [];
      var empImages = [];
      var itemClicked;
      var empClicked;

      function calc() {
        let total = 0;
        for (let i = 0; i < document.getElementsByName("quantity[]").length; i++) {
          let qty = parseInt(document.getElementsByName("quantity[]")[i].value);
          let price = parseFloat(document.getElementsByName("price[]")[i].value);
          if (!isNaN(qty * price)) {
            let subtotal = Math.round(qty * price * 1000) / 1000;
            total = total + subtotal;
            let vat = 0;
            if (document.getElementsByName("currency")[0].value == "BHD") {
              vat = Math.round(total * 0.1 * 1000) / 1000;
            }
            document.getElementById("currentTotalInput").value = total;
            document.getElementById("vatInput").value = vat;
            document.getElementById("grandTotalInput").value = Math.round((vat + total) * 1000) / 1000;
          }
        }
      }

      function searchItem(x) {
        document.getElementById("itemsDiv").style.display = "block";
        document.getElementById('itemPopup').style.display = "block";
        document.getElementById('itemAddDiv').style.display = "none";
        document.getElementById('itemLoading').style.display = "none";
        document.getElementById('addNewItemPopupBtn').style.display = "block";
        document.getElementById('searchItemPopupBtn').style.display = "none";
        document.getElementById("newItemName").value = "";
        document.getElementById("newItemBrand").value = "";
        document.getElementById("newItemStock").value = "0";
        document.getElementById("newItemCategory").selectedIndex = 0;
        itemClicked = x;
      }

      function showItemForm() {
        document.getElementById('itemPopup').style.display = "none";
        document.getElementById('itemLoading').style.display = "none";
        document.getElementById('itemAddDiv').style.display = "block";
        document.getElementById('addNewItemPopupBtn').style.display = "none";
        document.getElementById('searchItemPopupBtn').style.display = "block";
      }

      function addNewItemSubmitted() {
        document.getElementById("itemLoading").innerHTML = "<h3 class='w3-margin-top w3-center'>Loading ...</h3>";
        if (document.getElementById('newItemName').value.trim().length < 1) {
          alert("Please fill item's name !");
        } else {
          let postData;
          postData = "name=" + document.getElementById('newItemName').value.trim();
          postData = postData + "&brand=" + document.getElementById('newItemBrand').value.trim();
          postData = postData + "&stock=" + document.getElementById('newItemStock').value.trim();
          postData = postData + "&category=" + document.getElementById('newItemCategory').value;
          postData = postData + "&user=<?php echo $row['id']; ?>";
          document.getElementById("itemAddDiv").style.display = "none";
          document.getElementById("itemLoading").style.display = "block";
          var xhr = new XMLHttpRequest();
          xhr.open("POST", 'addNewItem.php', true);
          xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
              if (xhr.responseText == "added") {
                document.getElementById("itemLoading").innerHTML = "<h3 class='w3-margin-top w3-center w3-green'>Added Successfully!</h3>";

                var xhr2 = new XMLHttpRequest();
                xhr2.open("POST", 'getItems.php', true);
                xhr2.onreadystatechange = function() {
                  if (xhr2.readyState == XMLHttpRequest.DONE && xhr2.status == 200) {
                    var jsonObj = JSON.parse(xhr2.responseText);
                    itemsNames = [];
                    itemsBrands = [];
                    itemsIDs = [];
                    itemsStock = [];
                    for (var x = 0; x < jsonObj.length; x++) {
                      itemsNames.push(jsonObj[x].name);
                      itemsBrands.push(jsonObj[x].brand);
                      itemsIDs.push(jsonObj[x].id);
                      itemsStock.push(jsonObj[x].stock);
                    }
                  }
                }
                xhr2.send();
              } else if (xhr.responseText == "alreadyAdded") {
                document.getElementById("itemLoading").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed, Already Added</h3>";
              } else {
                document.getElementById("itemLoading").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed</h3>";
              }
            }
          }
          xhr.send(postData);
        }
      }

      function searchClicked2(e) {
        if ((document.getElementById('searchInput2').value.trim().length > 1)) {
          document.getElementById("defaultSearchItems").style.display = "none";
          document.getElementById("resultSearchListItems").style.display = "block";
          document.getElementById("resultSearchListItems").innerHTML = "";
          for (var i = 0; i < itemsNames.length; i++) {
            if (itemsNames[i].toUpperCase().includes(document.getElementById("searchInput2").value.trim().toUpperCase()) || itemsBrands[i].toUpperCase().includes(document.getElementById("searchInput2").value.trim().toUpperCase())) {
              document.getElementById("resultSearchListItems").innerHTML = document.getElementById("resultSearchListItems").innerHTML + "<li><div onclick='addItem(" + i + ")' class='w3-padding vendorResultElement' style='border-bottom:1px solid #e1e1e1;cursor:pointer;'><h6 style='margin:0px;color:#0b5266;'>" + itemsNames[i] + "</h6><p class='w3-text-grey' style='margin:0px;'><b>" + itemsBrands[i] + "</b></p></li>";
            }
          }
        } else {
          document.getElementById("resultSearchListItems").innerHTML = "";
          document.getElementById("resultSearchListItems").style.display = "none";
          document.getElementById("defaultSearchItems").style.display = "block";
        }
      }

      function addItem(x) {
        document.getElementById("itemInputsName" + itemClicked).value = itemsNames[x];
        document.getElementById("itemInputsID" + itemClicked).value = itemsIDs[x];
        if (document.getElementById("itemAvailable" + itemClicked)) {
          if (itemsStock[x] > 0) {
            document.getElementById("itemAvailable" + itemClicked).innerHTML = "<span class='w3-tag w3-green w3-round itemAvailableSpan'>" + itemsStock[x] + "</span>";
          } else {
            document.getElementById("itemAvailable" + itemClicked).innerHTML = "<span class='w3-tag w3-red w3-round itemAvailableSpan'>" + itemsStock[x] + "</span>";
          }
        }
        document.getElementById("itemsDiv").style.display = "none";
      }

      function showItemSearchForm() {
        document.getElementById('itemPopup').style.display = "block";
        document.getElementById('itemLoading').style.display = "none";
        document.getElementById('itemAddDiv').style.display = "none";
        document.getElementById('addNewItemPopupBtn').style.display = "block";
        document.getElementById('searchItemPopupBtn').style.display = "none";
      }

      function searchEmp(x) {
        document.getElementById("empDiv").style.display = "block";
        document.getElementById('empPopup').style.display = "block";
        document.getElementById('empAddDiv').style.display = "none";
        document.getElementById('empLoading').style.display = "none";
        document.getElementById('addNewEmpPopupBtn').style.display = "block";
        document.getElementById('searchEmpPopupBtn').style.display = "none";
        document.getElementById("newEmpID").value = "";
        document.getElementById("newempName").value = "";
        empClicked = x;
      }

      function addEmp(x) {
        document.getElementById("empInputsName" + empClicked).value = empNames[x];
        document.getElementById("empInputsID" + empClicked).value = empIDs[x];
        if (empClicked == 0) {
          document.getElementById("empInputsName1").value = empNames[x];
          document.getElementById("empInputsID1").value = empIDs[x];
          document.getElementById("empInputsName2").value = empNames[x];
          document.getElementById("empInputsID2").value = empIDs[x];
        }
        document.getElementById("empDiv").style.display = "none";
      }

      function searchClicked3(e) {
        if ((document.getElementById('searchInput3').value.trim().length > 1)) {
          document.getElementById("defaultSearchEmp").style.display = "none";
          document.getElementById("resultSearchListEmp").style.display = "block";
          document.getElementById("resultSearchListEmp").innerHTML = "";
          for (var i = 0; i < empNames.length; i++) {
            if (empNames[i].toUpperCase().includes(document.getElementById("searchInput3").value.trim().toUpperCase()) || empIDs[i].toUpperCase().includes(document.getElementById("searchInput3").value.trim().toUpperCase())) {
              document.getElementById("resultSearchListEmp").innerHTML = document.getElementById("resultSearchListEmp").innerHTML + `
              <div onclick="addEmp(${i})"
               class="vendorResultElement w3-padding"
               style="
                 display: flex;
                 align-items: center;
                 gap: 10px;
                 border-bottom: 1px solid #e1e1e1;
                 cursor: pointer;
               ">
            <img src="http://iss.bfginternational.com/ISS/itemsImages/${empImages[i]}"
                 alt="Employee Image"
                 style="
                   width: 50px;
                   height: 50px;
                   border-radius: 50%;
                   object-fit: cover;
                 ">
            <div>
              <h6 style="margin:0;color:#0b5266;">${empNames[i]}</h6>
              <p style="margin:0;color:#666;"><b>${empIDs[i]}</b></p>
            </div>
          </div>
              `
            }
          }
        } else {
          document.getElementById("resultSearchListEmp").innerHTML = "";
          document.getElementById("resultSearchListEmp").style.display = "none";
          document.getElementById("defaultSearchEmp").style.display = "block";
        }
      }

      function validateNumber(e) {
        allowArray = [".", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Delete", "Backspace", "ArrowLeft", "ArrowRight"];
        if (!allowArray.includes(e.key)) {
          e.preventDefault();
        }
      }

      function addMoreItemsProvide() {
        let itemName = [];
        let itemID = [];
        let qty = [];
        let counter = document.getElementsByName('itemIDP[]').length;
        for (let i = 0; i < counter; i++) {
          if (i != 0) {
            itemName.push(document.getElementsByName('itemNameP[]')[i].value);
            itemID.push(document.getElementsByName('itemIDP[]')[i].value);
            qty.push(document.getElementsByName('provideQty[]')[i].value);
          }
        }
        document.getElementById("moreItemsDivProvide").innerHTML = document.getElementById("moreItemsDivProvide").innerHTML + `
          <div id="imP` + counter + `" class="w3-half">
            <div class="w3-col m6 s12 w3-padding">
              <p>
                <label><b>Item #` + (counter + 1) + `</b></label>
                <input id="itemInputsNameE` + counter + `" class="w3-input w3-border" type="text" name="itemNameP[]" disabled>
                <input id="itemInputsIDE` + counter + `" class="w3-input w3-border" style="opacity:0;width:0;" name="itemIDP[]" required>
              </p>
              <p>
                <a onclick="searchItem('E` + counter + `')" class="w3-btn w3-small" style="background:#128cae;color:#fff;">Search</a>
                <a onclick=removeItemP('` + counter + `') class="w3-btn w3-small w3-brown removebtnsP" style="background:#128cae;color:#fff;">X</a>
              </p>
            </div>
            <div class="w3-col m3 s12 w3-padding">
              <p>
                <label><b>Quantity #` + (counter + 1) + `</b></label>
                <input class="w3-input w3-border" type="number" id="qtyPInput` + counter + `" name="provideQty[]" min="1" required>
              </p>
            </div>
            <div class="w3-col m3 s12 w3-padding">
              <p>
                <label><b>Available #` + (counter + 1) + `</b></label>
                <div id="itemAvailableE` + counter + `"></div>
              </p>
            </div>
          </div>`;
        for (let i = 0; i < counter; i++) {
          if (i != 0) {
            document.getElementsByName('itemNameP[]')[i].value = itemName[i - 1];
            document.getElementsByName('itemIDP[]')[i].value = itemID[i - 1];
            document.getElementsByName('provideQty[]')[i].value = qty[i - 1];
          }
        }
        for (var x = 0; x < document.getElementsByClassName('removebtnsP').length; x++) {
          document.getElementsByClassName('removebtnsP')[x].style.display = "none";
        }
        document.getElementsByClassName('removebtnsP')[document.getElementsByClassName('removebtnsP').length - 1].style.display = "inline-block";
      }

      function removeItemP(index) {
        document.getElementById("imP" + index).remove();
        for (var x = 0; x < document.getElementsByClassName('removebtnsP').length; x++) {
          document.getElementsByClassName('removebtnsP')[x].style.display = "none";
        }
        if ((document.getElementsByClassName('removebtnsP').length) > 0) {
          document.getElementsByClassName('removebtnsP')[document.getElementsByClassName('removebtnsP').length - 1].style.display = "inline-block";
        }
      }

      function addProvideSubmitted() {
        let flag = true;
        for (let i = 0; i < document.getElementsByName("provideQty[]").length; i++) {
          if (parseInt(document.getElementsByName("provideQty[]")[i].value) > parseInt(document.getElementsByClassName("itemAvailableSpan")[i].innerHTML)) {
            flag = false;
            break;
          }
        }
        if (flag) {
          return true;
        } else {
          alert("Check Quantities Please !");
          return false;
        }
      }

      function showEmpForm() {
        document.getElementById('empPopup').style.display = "none";
        document.getElementById('empLoading').style.display = "none";
        document.getElementById('empAddDiv').style.display = "block";
        document.getElementById('addNewEmpPopupBtn').style.display = "none";
        document.getElementById('searchEmpPopupBtn').style.display = "block";
      }

      function addNewEmpSubmitted() {
        document.getElementById("empLoading").innerHTML = "<h3 class='w3-margin-top w3-center'>Loading ...</h3>";
        if (document.getElementById('newEmpID').value.trim().length < 1 || document.getElementById('newempName').value.trim().length < 1) {
          alert("Please fill employee's name and ID !");
        } else {
          let postData;
          postData = "name=" + document.getElementById('newempName').value.trim();
          postData = postData + "&empID=" + document.getElementById('newEmpID').value.trim();
          postData = postData + "&user=<?php echo $row['id']; ?>";
          document.getElementById("empAddDiv").style.display = "none";
          document.getElementById("empLoading").style.display = "block";
          var xhr = new XMLHttpRequest();
          xhr.open("POST", 'addNewEmp.php', true);
          xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
              if (xhr.responseText == "added") {
                document.getElementById("empLoading").innerHTML = "<h3 class='w3-margin-top w3-center w3-green'>Added Successfully!</h3>";

                var xhr2 = new XMLHttpRequest();
                xhr2.open("POST", 'getEmployees.php', true);
                xhr2.onreadystatechange = function() {
                  if (xhr2.readyState == XMLHttpRequest.DONE && xhr2.status == 200) {
                    var jsonObj = JSON.parse(xhr2.responseText);
                    empNames = [];
                    empIDs = [];
                    for (var x = 0; x < jsonObj.length; x++) {
                      empNames.push(jsonObj[x].name);
                      empIDs.push(jsonObj[x].empID);
                    }
                  }
                }
                xhr2.send();

              } else if (xhr.responseText == "alreadyAdded") {
                document.getElementById("empLoading").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed, Already Added</h3>";
              } else {
                document.getElementById("empLoading").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed</h3>";
              }
            }
          }
          xhr.send(postData);
        }
      }

      function showEmpSearchForm() {
        document.getElementById('empPopup').style.display = "block";
        document.getElementById('empLoading').style.display = "none";
        document.getElementById('empAddDiv').style.display = "none";
        document.getElementById('addNewEmpPopupBtn').style.display = "block";
        document.getElementById('searchEmpPopupBtn').style.display = "none";
      }
    </script>

    <style>
      input,
      select,
      textarea {
        background: #f9f9f9 !important;
      }

      input:focus,
      select:focus,
      textarea:focus {
        background: #f7f1ef !important;
      }

      input[type=submit] {
        background: #0b5266 !important;
        color: #fff;
        width: 150px;
      }

      label {
        color: #0b5266;
      }

      h4 {
        margin: 0 !important;
        background: #f7f1ef !important;
      }

      .vendorResultElement {
        transition: all 0.5s;
      }

      .vendorResultElement:hover {
        background: #f1f1f1 !important;
      }
    </style>

    <div class="w3-container w3-margin-top" style="padding-bottom:40px;">
      <div class="w3-margin-top w3-padding w3-light-grey" style="padding-bottom:40px !important;">
        <h1 class="w3-padding title">Add New Provide</h1>
        <form action="addProvide.php" method="post" onsubmit="return addProvideSubmitted()">
          <input type="hidden" name="user" value="<?php echo $row['id']; ?>">
          <div class="w3-row">
            <div class="w3-row w3-card-2 w3-white">
              <h4 class="w3-padding"><i>Item Details</i></h4>
              <div class="w3-half">
                <div class="w3-col m6 s12 w3-padding">
                  <p>
                    <label><b>Item</b></label>
                    <input id="itemInputsNameE0" class="w3-input w3-border" type="text" name="itemNameP[]" disabled>
                    <input id="itemInputsIDE0" class="w3-input w3-border" style="opacity:0;width:0;" name="itemIDP[]" required>
                  </p>
                  <p>
                    <a onclick="searchItem('E0')" class="w3-btn w3-small" style="background:#128cae;color:#fff;">Search</a>
                  </p>
                </div>
                <div class="w3-col m3 s12 w3-padding">
                  <p>
                    <label><b>Quantity</b></label>
                    <input class="w3-input w3-border" type="number" name="provideQty[]" min="1" required>
                  </p>
                </div>
                <div class="w3-col m3 s12 w3-padding">
                  <p>
                    <label><b>Available</b></label>
                  <div id="itemAvailableE0"></div>
                  </p>
                </div>
              </div>
              <div id="moreItemsDivProvide"></div>
              <div class="w3-col m12 s12 w3-padding" style="">
                <a class="w3-small" onclick="addMoreItemsProvide()" style="text-decoration:underline;color:#0b5266;cursor:pointer;">+ add more items</a>
              </div>
            </div>
            <div class="w3-row w3-card-2 w3-white w3-margin-top">
              <h4 class="w3-padding"><i>Request Details</i></h4>
              <div class="w3-col m3 s12 w3-padding">
                <p>
                  <label><b>Employee</b></label>
                  <input id="empInputsName0" class="w3-input w3-border" type="text" name="empName" disabled>
                  <input id="empInputsID0" class="w3-input w3-border" style="opacity:0;width:0;" name="empID" required>
                </p>
                <p>
                  <a onclick="searchEmp(0)" class="w3-btn w3-small" style="background:#128cae;color:#fff;">Search</a>
                </p>
              </div>
              <div class="w3-col m3 s12 w3-padding">
                <p>
                  <label><b>Requested By</b></label>
                  <input id="empInputsName1" class="w3-input w3-border" type="text" disabled>
                  <input id="empInputsID1" class="w3-input w3-border" style="opacity:0;width:0;" name="RequestedBy" required>
                </p>
                <p>
                  <a onclick="searchEmp(1)" class="w3-btn w3-small" style="background:#128cae;color:#fff;">Search</a>
                </p>
              </div>
              <div class="w3-col m3 s12 w3-padding">
                <p>
                  <label><b>Received By</b></label>
                  <input id="empInputsName2" class="w3-input w3-border" type="text" disabled>
                  <input id="empInputsID2" class="w3-input w3-border" style="opacity:0;width:0;" name="ReceivedBy" required>
                </p>
                <p>
                  <a onclick="searchEmp(2)" class="w3-btn w3-small" style="background:#128cae;color:#fff;">Search</a>
                </p>
              </div>
              <div class="w3-col m3 s12 w3-padding">
                <p>
                  <label><b>Provided Date</b></label>
                  <input class="w3-input w3-border" type="date" name="providedDate" value="<?php echo date('Y-m-d'); ?>">
                </p>
              </div>
              <div class="w3-col m3 s12 w3-padding">
                <p>
                  <?php
                  $token = $_SESSION["ISStoken"];
                  ?>
                  <label><b>Provided By</b></label>
                  <select class="w3-select w3-border w3-padding" name="providedBy">
                    <?php
                    $sql2 = "SELECT * FROM `users`";
                    if (!$result2 = $mysqli->query($sql2)) {
                      die("queryFailed");
                    }
                    if ($result2->num_rows === 0) {
                      echo "<option value='0'>No User</option>";
                    } else {
                      while ($row2 = $result2->fetch_assoc()) {
                        if ($token == $row2['token']) {
                          echo '<option value="' . $row2['id'] . '" selected>' . $row2['name'] . '</option>';
                        } else {
                          echo "<option value='" . $row2['id'] . "'>" . $row2['name'] . "</option>";
                        }
                      }
                    }
                    ?>
                  </select>
                </p>
              </div>
            </div>
            <div class="w3-row w3-card-2 w3-white w3-margin-top">
              <h4 class="w3-padding"><i>Notes</i></h4>
              <div class="w3-col m4 s12 w3-padding">
                <p>
                  <label><b>Notes</b></label>
                  <textarea class="w3-input w3-border" name="notes" rows="5" cols="80" style="resize:none;"></textarea>
                </p>
              </div>
            </div>
            <p style="text-align:right;">
              <input class="w3-btn" type="submit" value="SUBMIT">
            </p>
          </div>
        </form>
      </div>
    </div>

    <div id="itemsDiv" class="w3-modal">
      <div class="w3-modal-content w3-animate-top">
        <div id="itemPopup" class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
          <div class="w3-container w3-margin">
            <input onkeyup="searchClicked2(event)" id="searchInput2" placeholder="search name/brand" class="w3-input w3-border" type="text">
          </div>
          <ul id="resultSearchListItems" class="w3-ul w3-small w3-margin" style="display:none;"></ul>
          <ul id="defaultSearchItems" class="w3-ul w3-small w3-margin">
            <li style='cursor:pointer;'>
              <div>
                <?php
                $sql3 = "SELECT * FROM `items` WHERE `inActive`=0";
                if (!$result3 = $mysqli->query($sql3)) {
                  die("queryFailed");
                }
                if ($result3->num_rows === 0) {
                  echo "no items";
                } else {
                  $counter = 0;
                  while ($row3 = $result3->fetch_assoc()) {
                    $item = addslashes($row3['name']);
                ?>
                    <script>
                      itemsNames.push("<?php echo $item; ?>");
                      itemsBrands.push("<?php echo $row3['brand']; ?>");
                      itemsIDs.push("<?php echo $row3['id']; ?>");
                      itemsStock.push("<?php echo $row3['stock']; ?>");
                    </script>
                <?php
                    echo "<div onclick='addItem(" . $counter . ")' class='w3-padding vendorResultElement' style='border-bottom:1px solid #e1e1e1'>";
                    echo "<h6 style='margin:0px;color:#0b5266;'>" . $row3['name'] . "</h6>";
                    echo "<p class='w3-text-grey' style='margin:0px;'><b>" . $row3['brand'] . "</b></p>";
                    echo "</div>";
                    $counter = $counter + 1;
                  }
                }
                ?>
              </div>
            </li>
          </ul>
        </div>
        <div id="itemAddDiv" class="w3-container" style="height:550px;overflow:auto;display:none;padding-bottom:24px;">
          <h3>Add New Item</h3>
          <p>
            <label>Name</label>
            <input id="newItemName" class="w3-input w3-border" type="text" maxlength="100">
          </p>
          <p>
            <label>Brand</label>
            <input id="newItemBrand" class="w3-input w3-border" type="text" maxlength="100">
          </p>
          <p>
            <label>Stock</label>
            <input id="newItemStock" class="w3-input w3-border" type="number" value="0">
          </p>
          <p>
            <label>Category</label>
            <select class="w3-select w3-border w3-padding" id="newItemCategory">
              <option value="IT Stationery and Accessories">IT Stationery and Accessories</option>
              <option value="Hardware">Hardware</option>
              <option value="Toners/Rolls">Toners/Rolls</option>
            </select>
          </p>
          <div>
            <a onclick="addNewItemSubmitted()" class="w3-margin-top w3-btn" style="background:#128cae;color:#fff;">Add Item</a>
          </div>
        </div>
        <div id="itemLoading" class="w3-container" style="height:550px;overflow:auto;display:none;padding-bottom:24px;">
          <h3 class="w3-margin-top w3-center">Loading ...</h3>
        </div>
        <div class="w3-container w3-light-grey w3-padding">
          <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('itemsDiv').style.display='none'">Close</div>
          <div id="addNewItemPopupBtn" class="w3-btn w3-right w3-white w3-border w3-small w3-margin-right" onclick="showItemForm()">Add New</div>
          <div id="searchItemPopupBtn" style="display:none;" class="w3-btn w3-right w3-white w3-border w3-small w3-margin-right" onclick="showItemSearchForm()">Search</div>
        </div>
      </div>
    </div>

    <div id="empDiv" class="w3-modal">
      <div class="w3-modal-content w3-animate-top">
        <div id="empPopup" class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
          <div class="w3-container w3-margin">
            <input onkeyup="searchClicked3(event)" id="searchInput3" placeholder="search name/ID" class="w3-input w3-border" type="text">
          </div>
          <ul id="resultSearchListEmp" class="w3-ul w3-small w3-margin" style="display:none; padding: 8px 16px;"></ul>
          <ul id="defaultSearchEmp" class="w3-ul w3-small w3-margin">
            <li style='cursor:pointer;'>
              <div>
                <?php
                $sql4 = "SELECT * FROM `employees` WHERE `inActive`=0";
                if (!$result4 = $mysqli->query($sql4)) {
                  die("queryFailed");
                }
                if ($result4->num_rows === 0) {
                  echo "no employees";
                } else {
                  $counter = 0;
                  while ($row4 = $result4->fetch_assoc()) {
                ?>
                    <script>
                      empNames.push("<?php echo $row4['name']; ?>");
                      empIDs.push("<?php echo $row4['empID']; ?>");
                      empImages.push("<?php echo $row4['image']; ?>");
                    </script>
                <?php
                    echo "
                        <div onclick='addEmp($counter)' 
                            class='vendorResultElement w3-padding' 
                            style='
                                display: flex;
                                align-items: center;
                                gap: 10px;
                                border-bottom: 1px solid #e1e1e1;
                                cursor: pointer;
                            '>
                          <img src='http://iss.bfginternational.com/ISS/itemsImages/{$row4['image']}' 
                              alt='Employee Image'
                              style='
                                  width: 50px;
                                  height: 50px;
                                  border-radius: 50%;
                                  object-fit: cover;
                              '/>
                          <div>
                            <h6 style='margin:0;color:#0b5266;'>{$row4['name']}</h6>
                            <p style='margin:0;color:#666;'><b>{$row4['empID']}</b></p>
                          </div>
                        </div>
                        ";
                    $counter = $counter + 1;
                  }
                }
                $mysqli->close();
                ?>
              </div>
            </li>
          </ul>
        </div>
        <div id="empAddDiv" class="w3-container" style="height:550px;overflow:auto;display:none;padding-bottom:24px;">
          <h3>Add New Employee</h3>
          <p>
            <label>ID</label>
            <input id="newEmpID" class="w3-input w3-border" type="number" maxlength="10">
          </p>
          <p>
            <label>Name</label>
            <input id="newempName" class="w3-input w3-border" type="text" maxlength="100">
          </p>
          <div>
            <a onclick="addNewEmpSubmitted()" class="w3-margin-top w3-btn" style="background:#128cae;color:#fff;">Add Emplyee</a>
          </div>
        </div>
        <div id="empLoading" class="w3-container" style="height:550px;overflow:auto;display:none;padding-bottom:24px;">
          <h3 class="w3-margin-top w3-center">Loading ...</h3>
        </div>
        <div class="w3-container w3-light-grey w3-padding">
          <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('empDiv').style.display='none'">Close</div>
          <div id="addNewEmpPopupBtn" class="w3-btn w3-right w3-white w3-border w3-small w3-margin-right" onclick="showEmpForm()">Add New</div>
          <div id="searchEmpPopupBtn" style="display:none;" class="w3-btn w3-right w3-white w3-border w3-small w3-margin-right" onclick="showEmpSearchForm()">Search</div>
        </div>
      </div>
    </div>

<?php
  }
} else {
  die("<meta http-equiv='refresh' content='0;url=index.php' />");
}
?>