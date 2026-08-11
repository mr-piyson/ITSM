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
    if (isset($_GET["code"]) && !empty($_GET["code"])) {
      $row = $result->fetch_array(MYSQLI_ASSOC);
      $code = htmlspecialchars($_GET['code'], ENT_QUOTES);
      $input2 = mysqli_real_escape_string($mysqli, $code);
      $sql2 = "SELECT assets.id,assets.code,assets.serialNumber,assets.deviceName,assets.type,assets.location,assets.manufacturer,assets.model,assets.department,
                        assets.processor,assets.os,assets.memory,assets.hdd,assets.ip,assets.specification,assets.image,assets.firmwareVer,employees.name as owner,
                        employees.image as empImg,assets.macAddress,assets.deviceStatus,assets.purchaseDate,assets.purchasePrice,assets.warrantyDate,assets.warrantyStatus,assets.verified
                 FROM assets
                 LEFT JOIN employees
                 ON assets.empID = employees.empID
                 WHERE assets.code = '" . $input2 . "'";
      if (!$result2 = $mysqli->query($sql2)) {
        $mysqli->close();
        die("queryFailed");
      }
      if ($result2->num_rows === 0) {
        die("<meta http-equiv='refresh' content='0;url=index.php' />");
      } else {
        $row2 = $result2->fetch_array(MYSQLI_ASSOC);
      }
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
?>
      <script src="qrcode.js"></script>
      <script>
        var empNames = [];
        var empIDs = [];
        var empImages = [];
        window.onload = function() {
          new QRCode(document.getElementById("qrcode"), {
            text: "http://iss.bfginternational.com/ISS/assetDetails.php?code=<?php echo $row2['code']; ?>",
            width: 200,
            height: 200
          });
          document.getElementById("assetLocation").value = "<?php echo $row2['location']; ?>";
          document.getElementById("assetDepartment").value = "<?php echo $row2['department']; ?>";
          document.getElementById("assetDeviceStatus").value = "<?php echo $row2['deviceStatus']; ?>";
          document.getElementById("assetWarrantyStatus").value = "<?php echo $row2['warrantyStatus']; ?>";
        }

        function showDeleteAssetModa() {
          document.getElementById('deleteAssetGeneralInfo').style.display = 'block';
        }

        function updateAssetSubmitted() {
          document.getElementById("updateDiv").innerHTML = "<h3 class='w3-margin-top w3-center'>Loading ...</h3>";

          var formData = new FormData();
          formData.append("type", document.getElementById("assetType").value.trim());
          formData.append("location", document.getElementById("assetLocation").value.trim());
          formData.append("department", document.getElementById("assetDepartment").value.trim());
          formData.append("serialNumber", document.getElementById("assetSerialNumber").value.trim());
          formData.append("manufacturer", document.getElementById("assetManufacturer").value.trim());
          formData.append("model", document.getElementById("assetModel").value.trim());
          formData.append("ip", document.getElementById("assetIp").value.trim());
          formData.append("deviceName", document.getElementById("assetDeviceName").value.trim());
          formData.append("processor", document.getElementById("assetProcessor").value.trim());
          formData.append("os", document.getElementById("assetOperatingSystem").value.trim());
          formData.append("memory", document.getElementById("assetMemory").value.trim());
          formData.append("hdd", document.getElementById("assetHardDisk").value.trim());
          formData.append("specification", document.getElementById("assetSpecifications").value.trim());
          formData.append("firmware", document.getElementById("assetFirmware").value.trim());
          formData.append("macAddress", document.getElementById("assetMacAddress").value.trim());
          formData.append("deviceStatus", document.getElementById("assetDeviceStatus").value.trim());
          formData.append("purchaseDate", document.getElementById("assetPurchaseDate").value.trim());
          formData.append("purchasePrice", document.getElementById("assetPurchasePrice").value.trim());
          formData.append("warrantyDate", document.getElementById("assetWarrantyDate").value.trim());
          formData.append("warrantyStatus", document.getElementById("assetWarrantyStatus").value.trim());
          if (document.getElementById("assetVerified").checked) {
            formData.append("assetVerified", "yes");
          } else {
            formData.append("assetVerified", "no");
          }
          formData.append("user", "<?php echo $row['id']; ?>");
          formData.append("assetID", "<?php echo $row2['id']; ?>");
          if (document.getElementById('assetImage').files.length > 0) {
            formData.append("file", document.getElementById('assetImage').files[0]);
          }

          var xhr = new XMLHttpRequest();
          xhr.open("POST", 'updateAsset.php', true);
          xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
              document.getElementById("updateHeaderDiv").style.display = "block";
              document.getElementById("updateAssetGeneralInfoDiv").style.display = "none";
              if (xhr.responseText == "added") {
                document.getElementById("updateHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-green'>Updated Successfully!</h3>";
                setTimeout(function() {
                  location.reload();
                }, 1000);
              } else {
                document.getElementById("updateHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed</h3>";
              }
            }
          }
          xhr.send(formData);
        }

        function showUpdateAssetModal() {
          document.getElementById('updateAssetGeneralInfo').style.display = 'block';
        }

        function showUpdateOwnerModal() {
          document.getElementById('updateOwnerModal').style.display = 'block';
        }

        function searchClicked(e) {
          const input = document.getElementById('searchInput').value.trim();
          const defaultList = document.getElementById("defaultSearchEmp");
          const resultList = document.getElementById("resultSearchListEmp");

          if (input.length > 1) {
            defaultList.style.display = "none";
            resultList.style.display = "block";
            resultList.innerHTML = "";

            const query = input.toUpperCase();

            for (let i = 0; i < empNames.length; i++) {
              if (
                empNames[i].toUpperCase().includes(query) ||
                empIDs[i].toUpperCase().includes(query)
              ) {
                resultList.innerHTML += `
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
        `;
              }
            }
          } else {
            resultList.innerHTML = "";
            resultList.style.display = "none";
            defaultList.style.display = "block";
          }
        }


        function addEmp(x) {
          document.getElementById("updateOwnerModalDiv").style.display = "none";
          document.getElementById("updateOwnerHeaderDiv").style.display = "block";
          document.getElementById("updateOwnerHeaderDiv").innerHTML = "<h4>Loading ... </h4>";
          var xhr = new XMLHttpRequest();
          xhr.open("POST", 'updateAssetOwner.php', true);
          xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
              if (xhr.responseText == "updated") {
                document.getElementById("updateOwnerHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-green'>Updated Successfully!</h3>";
                setTimeout(function() {
                  location.reload();
                }, 1000);
              } else {
                document.getElementById("updateOwnerHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed</h3>";
              }
            }
          }
          xhr.send("assetID=<?php echo $row2['id'] ?>&user=<?php echo $row['id'] ?>&newOwner=" + empIDs[x]);
        }
      </script>
      <style>
        input {
          outline: none;
        }
      </style>
      <div class="w3-container w3-padding" style="padding-bottom:40px !important;">
        <div class="w3-padding">
          <a class="w3-small w3-btn w3-border" href="assets.php">BACK</a>
        </div>
        <div>
          <h1 class="w3-padding title" style="margin:0">Asset Details</h1>
          <div class="w3-padding">
            <a class="w3-btn w3-border w3-small" onclick="showUpdateOwnerModal()">Update Owner</a>
            <a class="w3-btn w3-border w3-small" onclick="showUpdateAssetModal()">Update</a>
            <a class="w3-btn w3-border w3-small" onclick="showDeleteAssetModa()">Delete</a>
          </div>
          <div class="w3-row">
            <div class="w3-third w3-padding">
              <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                <i>General Information</i>
              </div>
              <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                <tr>
                  <td><b>Code</b></td>
                  <td><?php echo $row2["code"]; ?></td>
                </tr>
                <tr>
                  <td><b>Type</b></td>
                  <td><?php echo $row2["type"]; ?></td>
                </tr>
                <tr>
                  <td><b>Status</b></td>
                  <?php
                  echo "<td>";
                  if ($row2["deviceStatus"] == "In Use") {
                    echo "<span class='w3-tag w3-red'>" . $row2['deviceStatus'] . "</span>";
                  } elseif ($row2["deviceStatus"] == "Defective") {
                    echo "<span class='w3-tag w3-brown'>" . $row2['deviceStatus'] . "</span>";
                  } else {
                    echo "<span class='w3-tag w3-green'>" . $row2['deviceStatus'] . "</span>";
                  }
                  if ($row2["verified"] != "0000-00-00 00:00:00") {
                    echo "<span class='w3-tag w3-blue'>Verified</span>";
                  }
                  echo "</td>";
                  ?>
                </tr>
                <tr>
                  <td><b>Location</b></td>
                  <td><?php echo $row2["location"]; ?></td>
                </tr>
                <tr>
                  <td><b>Department</b></td>
                  <td><?php echo $row2["department"]; ?></td>
                </tr>
                <tr>
                  <td><b>Owner</b></td>
                  <td>
                    <?php if (!empty($row2["empImg"])) { ?>
                      <div style="display:inline-block;border-radius:25px;width:50px;height:50px;vertical-align: middle;
                                    background:url('http://iss.bfginternational.com/ISS/itemsImages/<?php echo $row2['empImg']; ?>');
                                    background-size:cover;background-position:center;">
                      </div>
                    <?php } ?>
                    <?php echo $row2["owner"]; ?>
                  </td>
                </tr>
                <tr>
                  <td><b>Purchase Date</b></td>
                  <td><?php echo $row2["purchaseDate"]; ?></td>
                </tr>
                <tr>
                  <td><b>Purchase Price</b></td>
                  <td><?php echo $row2["purchasePrice"]; ?></td>
                </tr>
                <?php if (!empty($row2["image"])) { ?>
                  <tr>
                    <td colspan="2"><img style="width:100%;width:350px;" src="http://iss.bfginternational.com/ISS/itemsImages/<?php echo $row2['image']; ?>" /></td>
                  </tr>
                <?php } ?>
              </table>
            </div>
            <div class="w3-third w3-padding">
              <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                <i>Device Information</i>
              </div>
              <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                <tr>
                  <td><b>Device Name</b></td>
                  <td><?php echo $row2["deviceName"]; ?></td>
                </tr>
                <tr>
                  <td><b>Serial number</b></td>
                  <td><?php echo $row2["serialNumber"]; ?></td>
                </tr>
                <tr>
                  <td><b>Manufacturer</b></td>
                  <td><?php echo $row2["manufacturer"]; ?></td>
                </tr>
                <tr>
                  <td><b>Model</b></td>
                  <td><?php echo $row2["model"]; ?></td>
                </tr>
                <tr>
                  <td><b>MAC Address</b></td>
                  <td><?php echo $row2["macAddress"]; ?></td>
                </tr>
                <tr>
                  <td><b>IP</b></td>
                  <td><?php echo $row2["ip"]; ?></td>
                </tr>
                <tr>
                  <td><b>Firmware Version</b></td>
                  <td><?php echo $row2["firmwareVer"]; ?></td>
                </tr>
                <tr>
                  <td><b>Warranty Date</b></td>
                  <td><?php echo $row2["warrantyDate"]; ?></td>
                </tr>
                <tr>
                  <td><b>Warranty Status</b></td>
                  <?php if ($row2["warrantyStatus"] == "Expired") { ?>
                    <td><span class="w3-tag w3-red"><?php echo $row2["warrantyStatus"]; ?></span></td>
                  <?php } elseif ($row2["warrantyStatus"] == "Valid") { ?>
                    <td><span class="w3-tag w3-green"><?php echo $row2["warrantyStatus"]; ?></span></td>
                  <?php } else { ?>
                    <td><span class="w3-tag w3-yellow"><?php echo $row2["warrantyStatus"]; ?></span></td>
                  <?php } ?>
                </tr>
              </table>
              <div class="w3-card-2 w3-border w3-padding w3-margin-top" style="background:#eefafd;">
                <i>Computer Information</i>
              </div>
              <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                <tr>
                  <td><b>Processor</b></td>
                  <td><?php echo $row2["processor"]; ?></td>
                </tr>
                <tr>
                  <td><b>Operating System</b></td>
                  <td><?php echo $row2["os"]; ?></td>
                </tr>
                <tr>
                  <td><b>Memory</b></td>
                  <td><?php echo $row2["memory"]; ?></td>
                </tr>
                <tr>
                  <td><b>Hard Disk</b></td>
                  <td><?php echo $row2["hdd"]; ?></td>
                </tr>
              </table>
            </div>
            <div class="w3-third w3-padding">
              <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                <i>QR Code</i>
              </div>
              <table class="w3-table w3-card-2 w3-margin-top">
                <tr>
                  <td>
                    <div id="qrcode"></div>
                  </td>
                </tr>
                <tr>
                  <td><a href="qrPrint.php?code=<?php echo $row2['code']; ?>">to Print</a></td>
                </tr>
              </table>
              <div class="w3-card-2 w3-border w3-padding w3-margin-top" style="background:#eefafd;">
                <i>Other Information</i>
              </div>
              <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                <tr>
                  <td><b>Other Specifications</b></td>
                  <td><?php echo $row2["specification"]; ?></td>
                </tr>
                <tr>
                  <?php
                  if ($row2["verified"] != "0000-00-00 00:00:00") {
                    echo "<td><b>Verified Date</b></td>";
                    echo "<td>" . $row2["verified"] . "</td>";
                  }
                  ?>
                </tr>
              </table>
              <?php
              $sql3 = "SELECT a.oldOwnerEmpID,a.newOwnerID,a.date,e1.name as old,e2.name as new
                           FROM assestOwnerUpdateLogs a
                           LEFT JOIN employees e1
                           ON e1.empID = a.oldOwnerEmpID
                           LEFT JOIN employees e2
                           ON e2.empID = a.newOwnerID
                           WHERE a.assetID=" . $row2["id"];
              if (!$result3 = $mysqli->query($sql3)) {
                $mysqli->close();
                die("queryFailed");
              }
              if ($result3->num_rows > 0) {
                echo "<div class='w3-card-2 w3-border w3-padding w3-margin-top' style='background:#eefafd;'><i>Owner Change Logs</i></div>";
                echo "<table class='w3-table w3-table-all w3-card-2 w3-margin-top w3-small'>";
                while ($row3 = $result3->fetch_assoc()) {
                  echo "<tr>";
                  echo "<td>" . $row3['date'] . "</td>";
                  $o = $row3['old'];
                  if (empty($o)) {
                    $o = "none";
                  }
                  echo "<td>
                      <span class='w3-tag w3-light-grey'>" . $o . "</span><span class='w3-tag w3-dark-grey'>></span><span class='w3-tag w3-light-grey'>" . $row3['new'] . "</span>
                      </td>";
                  echo "</tr>";
                }
                echo "</table>";
              }
              ?>
            </div>
          </div>
        </div>
      </div>

      <div id="deleteAssetGeneralInfo" class="w3-modal">
        <div class="w3-modal-content w3-animate-top">
          <div class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
            <div class="w3-container w3-margin">
              <h2 class="title">Delete Asset</h2>
              <h4>Are You Sure Do You Want to Delete This Asset?</h4>
              <form action="deleteAsset.php" method="post">
                <input type="hidden" name="assetID" value="<?php echo $row2['id']; ?>">
                <input type="hidden" name="user" value="<?php echo $row['id']; ?>">
                <input class="w3-brown w3-btn" type="submit" value="Delete">
              </form>
            </div>
          </div>
          <div class="w3-container w3-light-grey w3-padding">
            <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('deleteAssetGeneralInfo').style.display='none'">Close</div>
          </div>
        </div>
      </div>

      <div id="updateAssetGeneralInfo" class="w3-modal">
        <div class="w3-modal-content w3-animate-top" style="width:62.5vw !important;">
          <div class="w3-container" style="height:79vh;overflow:auto;background:#f9f9f9;">
            <div id="updateHeaderDiv" style="display:none" class="w3-container w3-margin"></div>
            <div id="updateAssetGeneralInfoDiv" class="w3-container w3-margin">
              <h2 class="title">Update Asset Details</h2>
              <div class="w3-row">
                <div class="w3-third w3-padding">
                  <p>
                    <label>Type</label>
                    <input id="assetType" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['type']; ?>">
                  </p>
                  <p>
                    <label>Location</label>
                    <select id="assetLocation" class="w3-select w3-border w3-padding w3-white" style="height:40px;">
                      <option value=""></option>
                      <option value="Head Office">Head Office</option>
                      <option value="Factory 1">Factory 1</option>
                      <option value="Factory 2">Factory 2</option>
                      <option value="Factory 3">Factory 3</option>
                      <option value="Factory 4">Factory 4</option>
                      <option value="Factory 5 - Nass">Factory 5 - Nass</option>
                      <option value="IT Stores">IT Stores</option>
                    </select>
                  </p>
                  <p>
                    <label>Department</label>
                    <select id="assetDepartment" class="w3-select w3-border w3-padding w3-white" style="height:40px;">
                      <option value=""></option>
                      <option value="After Sales">After Sales</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Finance">Finance</option>
                      <option value="H2O">H2O</option>
                      <option value="HR">HR</option>
                      <option value="Health & Safety">Health & Safety</option>
                      <option value="I4">I4</option>
                      <option value="IT">IT</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Management">Management</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Planning">Planning</option>
                      <option value="Process">Process</option>
                      <option value="Projects">Projects</option>
                      <option value="SCM">SCM</option>
                      <option value="Sales">Sales</option>
                      <option value="Secretary">Secretary</option>
                      <option value="Wind Energy">Wind Energy</option>
                      <option value="Bids">Bids</option>
                      <option value="Business Development">Business Development</option>
                      <option value="Tooling">Tooling</option>
                      <option value="Quality">Quality</option>
                      <option value="Production">Production</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Final Quality">Final Quality</option>
                      <option value="Packing">Packing</option>
                      <option value="Resin Stores">Resin Stores</option>
                      <option value="Paint Stores">Paint Stores</option>
                      <option value="Gelcoating">Gelcoating</option>
                      <option value="Store">Store</option>
                      <option value="ABB">ABB</option>
                      <option value="Metal">Metal</option>
                    </select>
                  <p>
                    <label>Serial Number</label>
                    <input id="assetSerialNumber" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['serialNumber']; ?>">
                  </p>
                  <p>
                    <label>Manufacturer</label>
                    <input id="assetManufacturer" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['manufacturer']; ?>">
                  </p>
                  <p>
                    <label>Model</label>
                    <input id="assetModel" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['model']; ?>">
                  </p>
                  <p>
                    <label>Image</label>
                    <input id="assetImage" class="w3-input w3-border" type="file" accept="image/*">
                  </p>
                  <p>
                    <label>Firmware Version</label>
                    <input id="assetFirmware" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['firmwareVer']; ?>">
                  </p>
                </div>
                <div class="w3-third w3-padding">
                  <p>
                    <label>Device Name</label>
                    <input id="assetDeviceName" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['deviceName']; ?>">
                  </p>
                  <p>
                    <label>Processor</label>
                    <input id="assetProcessor" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['processor']; ?>">
                  </p>
                  <p>
                    <label>Operating System</label>
                    <input id="assetOperatingSystem" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['os']; ?>">
                  </p>
                  <p>
                    <label>Memory</label>
                    <input id="assetMemory" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['memory']; ?>">
                  </p>
                  <p>
                    <label>Hard Disk</label>
                    <input id="assetHardDisk" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['hdd']; ?>">
                  </p>
                  <p>
                    <label>Other Specifications</label>
                    <input id="assetSpecifications" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['specification']; ?>">
                  </p>
                  <p>
                    <label>Ip</label>
                    <input id="assetIp" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['ip']; ?>">
                  </p>
                  <p>
                    <label>MAC Address</label>
                    <input id="assetMacAddress" class="w3-input w3-border" type="text" maxlength="100" value="<?php echo $row2['macAddress']; ?>">
                  </p>
                </div>
                <div class="w3-third w3-padding">
                  <p>
                    <label>Device Status</label>
                    <select id="assetDeviceStatus" class="w3-select w3-border w3-padding w3-white" style="height:40px;">
                      <option value="In Use">In Use</option>
                      <option value="Available">Available</option>
                      <option value="Defective">Defective</option>
                    </select>
                  </p>
                  <p>
                    <label>Purchase Date</label>
                    <input id="assetPurchaseDate" class="w3-input w3-border" type="date" value="<?php echo $row2['purchaseDate']; ?>">
                  </p>
                  <p>
                    <label>Purchase Price</label>
                    <input id="assetPurchasePrice" class="w3-input w3-border" type="text" maxlength="50" value="<?php echo $row2['purchasePrice']; ?>">
                  </p>
                  <p>
                    <label>Warranty Date</label>
                    <input id="assetWarrantyDate" class="w3-input w3-border" type="date" value="<?php echo $row2['warrantyDate']; ?>">
                  </p>
                  <p>
                    <label>Warranty Status</label>
                    <select id="assetWarrantyStatus" class="w3-select w3-border w3-padding w3-white" style="height:40px;">
                      <option value="Valid">Valid</option>
                      <option value="Expired">Expired</option>
                      <option value="NA">NA</option>
                    </select>
                  </p>
                  <p>
                    <input id="assetVerified" class="w3-check" type="checkbox">
                    <label>Verified</label>
                  </p>
                  <div id="updateDiv" style="text-align:right;padding-top:22px;">
                    <a onclick="updateAssetSubmitted()" class="w3-btn" style="background:#128cae;color:#fff;">UPDATE</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="w3-container w3-light-grey w3-padding">
            <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('updateAssetGeneralInfo').style.display='none'">Close</div>
          </div>
        </div>
      </div>

      <div id="updateOwnerModal" class="w3-modal">
        <div class="w3-modal-content w3-animate-top">
          <div class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
            <div id="updateOwnerHeaderDiv" style="display:none;" class="w3-container w3-margin"></div>
            <div id="updateOwnerModalDiv" class="w3-container w3-margin">
              <h2 class="title">Update Asset Owner</h2>
              <div>
                <div class="w3-container w3-margin">
                  <input onkeyup="searchClicked(event)" id="searchInput" placeholder="search name/ID" class="w3-input w3-border" type="text">
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
                          $counter++;
                        }
                      }
                      $mysqli->close();
                      ?>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="w3-container w3-light-grey w3-padding">
            <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('updateOwnerModal').style.display='none'">Close</div>
          </div>
        </div>
      </div>
<?php
    } else {
      die("<meta http-equiv='refresh' content='0;url=index.php' />");
    }
  }
} else {
  die("<meta http-equiv='refresh' content='0;url=index.php' />");
}
?>