import {
  Anchor,
  Box,
  Button,
  FileInput,
  Flex,
  Group,
  Image,
  Modal,
  Select,
  Slider,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import axios from "axios";
import API_ENPOINTS from "../../API";
import {
  IconEdit,
  IconEditCircle,
  IconSquareRounded,
  IconSquareRoundedPlus,
  IconTrashX,
} from "@tabler/icons-react";

interface CodeFormats {
  id: number;
  Code: string;
  Type: string;
  PreFix: string;
  length: number;
  Sample: string;
  nextValue: number;
}

const CodeFormatss: React.FC = () => {
  const [viewUpdate, setViewUpdate] = useState(false);
  const [value, setValue] = useState(4);
  const [endValue, setEndValue] = useState(4);
  const [codeTypeText, setCodeTypeText] = useState("");
  const [codeType, setCodeType] = useState("");
  const [prefix, setPrefix] = useState("");
  const [codeLength, setCodeLength] = useState(0);
  const [codeSample, setCodeSample] = useState("");
  const [codeformats, setCodeFormats] = useState<CodeFormats[]>([]);
  
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      type: "",
      prefix: "",
      length: 0,
      sample: "",
      nextValue: "",
    },
  });
 
  const handleUdate = async (values: any) => {
    setCodeType(values.Code);
    setCodeTypeText(values.Type);
    setPrefix(values.PreFix);
    setCodeLength(values.length);
    setCodeSample(values.Sample);
    setViewUpdate(true);
  };

  const handleSampleCodeGen = (e: any) => {
    console.log(e.target.value);
    const pre = e.target.value
    setPrefix(pre)
    const codeSample  = pre+ String(1).padStart(endValue, '0');
    setCodeSample(codeSample)
  };
  const rows = codeformats.map((row) => {
    return (
      <Table.Tr key={row.Code}>
        <Table.Td style={{ textAlign: "left" }}>{row.Type}</Table.Td>
        <Table.Td style={{ textAlign: "left" }}>{row.PreFix}</Table.Td>
        <Table.Td style={{ textAlign: "left" }}>{row.length}</Table.Td>
        <Table.Td style={{ textAlign: "left" }}>{row.Sample}</Table.Td>
        <Table.Td style={{ textAlign: "left" }}>{row.nextValue}</Table.Td>
        <Table.Td>
          <Button onClick={() => handleUdate(row)}>
            <IconEdit /> Update
          </Button>
        </Table.Td>
      </Table.Tr>
    );
  });

  const handleCodeLength = (value: number) => {
      setEndValue(value)
      const thisLength = value
      const Pre = prefix
      setPrefix(Pre)
      const codeSample  = Pre+ String(1).padStart(thisLength, '0');
      setCodeSample(codeSample)
  }

  const handleSaveCodeUpdate = async (values: any) => {
      try {
        await axios.post(API_ENPOINTS.UPDATE_CODE_FORMAT, {
          type: codeType,
          prefix: prefix,
          length: codeLength,
          sample: codeSample    ,
          nextCode: 0,
        });

        setViewUpdate(false);
        loadCodes();
      } catch (error) {
        console.log(error);
      }
  }

  const loadCodes = async () => {
      try {
        const response = await axios.get(API_ENPOINTS.GET_CODE_FORMATS);
        if (Array.isArray(response.data)) {
          setCodeFormats(response.data);
        }
      } catch (error) {
        console.log(error);
      }
  }
  useEffect(() => {
      loadCodes()
  },[])
  return (
    <div>
      <Modal
        opened={viewUpdate}
        onClose={() => setViewUpdate(false)}
        title={
          <Group>
            <IconEditCircle size={20} />
            <span className="modal-header-text">Update Code Format</span>
          </Group>
        }
        size="lg"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        {/* <form onSubmit={form.onSubmit(handleCodeUpdate)}> */}
        <Text>Code Type :<span>{codeTypeText}</span></Text>
        <Group>
        <Box maw={400} mx="auto">
            <Slider
              value={value}
              onChange={setValue}
              onChangeEnd={handleCodeLength}
              min={0}
              max={10}
              thumbSize={26}
              color="violet"
            />

            <Text mt={5} size="sm">
              Code Length: <b>{endValue}</b>
            </Text>
          </Box>
        </Group>
        <Group>
          <TextInput
            withAsterisk
            label="Prefix"
            placeholder="PRD"
            value={prefix}
            {...form.getInputProps("prefix")}
            onChange={handleSampleCodeGen}
          />
          
        </Group>
        
        <Group>
          <Text>Sample Code : <span>{codeSample}</span></Text> 
        </Group>
        <Group justify="flex-start" mt="md">
          <Button type="submit" color="green" onClick={handleSaveCodeUpdate}>
            Update
          </Button>
          <Button onClick={() => setViewUpdate(false)} color="gray">
            Close
          </Button>
        </Group>
        {/* </form> */}
      </Modal>
      <Flex justify="space-between" align="center">
        <h4>Code Formats</h4>
      </Flex>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ textAlign: "left" }}>Module</Table.Th>
            <Table.Th style={{ textAlign: "left" }}>Prefix</Table.Th>{" "}
            <Table.Th style={{ textAlign: "left" }}>
              Length (After Prefix)
            </Table.Th>
            <Table.Th style={{ textAlign: "left" }}>Sample</Table.Th>
            <Table.Th style={{ textAlign: "left" }}>Next Code</Table.Th>
          </Table.Tr>
          </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
};

export default CodeFormatss;
